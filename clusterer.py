import os 
import ast
import numpy as np 
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"),user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )

def cosine_simillarity(vec1,vec2):
    dot_product = np.dot(vec1,vec2)
    norm_a = np.linalg.norm(vec1)
    norm_b = np.linalg.norm(vec2)
    return dot_product/(norm_a*norm_b)

def cluster_recent_posts():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT post_id, account_handle, headline, summary_embedding 
        FROM processed_intelligence 
        WHERE summary_embedding IS NOT NULL 
        ORDER BY id DESC LIMIT 100;
    """)

    recent_posts = cur.fetchall()
    print(f"Checking {len(recent_posts)} posts for duplicates...")

    #group them up 
    clusters = [] # will hold list of similar posts
    assigned_post_ids = set()

    for i in range(len(recent_posts)):
        post_i_id, handle_i, headline_i, emb_i_str = recent_posts[i]

        if post_i_id in assigned_post_ids:
            continue
        current_cluster = [(post_i_id, handle_i)]
        assigned_post_ids.add(post_i_id)

        #converting string back to a numpy array for math 
        emb_i = np.array(ast.literal_eval(emb_i_str))

        for j in range(i+1,len(recent_posts)):
            post_j_id, handle_j, headline_j, emb_j_str = recent_posts[j]

            if post_j_id in assigned_post_ids:
                continue

            emb_j = np.array(ast.literal_eval(emb_j_str))
            similarity = cosine_simillarity(emb_i,emb_j)

            # we are considering above 90% as same 

            if(similarity) > 0.80:
                current_cluster.append((post_j_id,handle_j))
                assigned_post_ids.add(post_j_id)
                # for debugging
                if similarity > 0.65:
                    print(f"🤖 Similarity Score: {similarity:.2f}")
                    print(f"  -> Post 1 (@{handle_i}): {headline_i}")
                    print(f"  -> Post 2 (@{handle_j}): {headline_j}")
                    print("-" * 50)
        clusters.append(current_cluster)
     # 2. Save clusters to database
    for cluster_group in clusters:
        # The first item is our primary post
        primary_post_id = cluster_group[0][0]
        
        try:
            # Insert the cluster (ON CONFLICT DO NOTHING prevents errors if it already exists)
            cur.execute("""
                INSERT INTO story_clusters (primary_post_id) 
                VALUES (%s) RETURNING id;
            """, (primary_post_id,))
            
            result = cur.fetchone()
            if result:
                cluster_id = result[0]
                # Insert all members of this cluster
                for member_post_id, member_handle in cluster_group:
                    cur.execute("""
                        INSERT INTO story_cluster_members (cluster_id, post_id, account_handle) 
                        VALUES (%s, %s, %s) ON CONFLICT DO NOTHING;
                    """, (cluster_id, member_post_id, member_handle))
            conn.commit()
        except Exception as e:
            conn.rollback()

    cur.close()
    conn.close()
    print("Clustering complete!")

if __name__ == "__main__":
    cluster_recent_posts()