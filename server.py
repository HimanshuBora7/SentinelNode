import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import get_connection

load_dotenv()

app = FastAPI(title="SentinelNode API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return{"status":"online","message":"api is healthy and running "}
@app.get("/api/feed")
def get_feed(category: str = None):
    conn = get_connection()
    cur = conn.cursor()
    try:
        if category and category.upper() != "ALL":
            # 1. Update the category-specific query
            cur.execute("""
                SELECT pi.id, pi.post_id, pi.account_handle, pi.category,pi.content_type,
                       pi.importance, pi.confidence_score, pi.headline,
                       pi.summary, pi.keywords, pi.entities,
                       rp.text AS original_text, rp.timestamp,
                       (SELECT COUNT(*) - 1 
                        FROM story_cluster_members scm 
                        JOIN story_clusters sc ON sc.id = scm.cluster_id 
                        WHERE sc.primary_post_id = pi.post_id) as additional_sources_count
                FROM processed_intelligence pi
                JOIN raw_posts rp ON pi.post_id = rp.post_id
                                WHERE UPPER(pi.category) = %s 
                  AND pi.post_id NOT IN (
                      SELECT scm.post_id 
                      FROM story_cluster_members scm
                      JOIN story_clusters sc ON sc.id = scm.cluster_id
                      WHERE scm.post_id != sc.primary_post_id
                  )

                ORDER BY rp.timestamp DESC
                LIMIT 20;
            """, (category.upper(),))
        else:
            # 2. Update the default "ALL" query
            cur.execute("""
                SELECT pi.id, pi.post_id, pi.account_handle, pi.category,pi.content_type,
                       pi.importance, pi.confidence_score, pi.headline,
                       pi.summary, pi.keywords, pi.entities,
                       rp.text AS original_text, rp.timestamp,
                       (SELECT COUNT(*) - 1 
                        FROM story_cluster_members scm 
                        JOIN story_clusters sc ON sc.id = scm.cluster_id 
                        WHERE sc.primary_post_id = pi.post_id) as additional_sources_count
                FROM processed_intelligence pi
                JOIN raw_posts rp ON pi.post_id = rp.post_id
                              WHERE pi.post_id NOT IN (
                      SELECT scm.post_id 
                      FROM story_cluster_members scm
                      JOIN story_clusters sc ON sc.id = scm.cluster_id
                      WHERE scm.post_id != sc.primary_post_id
                )

                ORDER BY rp.timestamp DESC
                LIMIT 20;
            """)

        rows = cur.fetchall()
        # Convert datetime objects to ISO strings for JSON serialization
        for row in rows:
            if row.get("timestamp"):
                row["timestamp"] = row["timestamp"].isoformat()
        return {"posts": rows}
    finally:
        cur.close()
        conn.close()

@app.get("/api/feed/{post_id}")
def get_post_detail(post_id: str):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT pi.*, rp.text as original_text, rp.timestamp, rp.post_url
            FROM processed_intelligence pi
            JOIN raw_posts rp ON pi.post_id = rp.post_id
            WHERE pi.post_id = %s;
        """, (post_id,))
        row = cur.fetchone()
        if not row:
            return {"error": "Not found"}, 404
        if row.get("timestamp"):
            row["timestamp"] = row["timestamp"].isoformat()
        return {"post": row}
    finally:
        cur.close()
        conn.close()

@app.get("/api/status")
def get_system_status():
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Check if there are any pending items
        cur.execute("SELECT COUNT(*) as count FROM raw_posts WHERE status = 'PENDING';")
        pending_count = cur.fetchone()["count"]
        
        # Check for recent failures
        cur.execute("SELECT status FROM source_health ORDER BY id DESC LIMIT 1;")
        latest_health = cur.fetchone()
        
        state = "online"
        if pending_count > 0:
            state = "scanning"
        elif latest_health and latest_health["status"] == "FAILED":
            state = "alert"
            
        return {"state": state, "pending_count": pending_count}
    except Exception as e:
        return {"state": "offline", "error": str(e)}
    finally:
        cur.close()
        conn.close()