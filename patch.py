import os

# 1. Fix BottomNav.css
bnav_path = "intel-ui/src/components/BottomNav/BottomNav.css"
with open(bnav_path, "r") as f:
    bnav = f.read()
if ".bottom-nav__logo {" not in bnav.split("@media")[0]:
    bnav = bnav.replace(".nav-label {\n  display: none;\n}", ".nav-label {\n  display: none;\n}\n.bottom-nav__logo {\n  display: none;\n}")
with open(bnav_path, "w") as f:
    f.write(bnav)

# 2. Fix Home.css
home_path = "intel-ui/src/styles/Home.css"
with open(home_path, "r") as f:
    home = f.read()

# Replace the entire media query
import re
new_media = """@media (min-width: 1024px) {
  .home {
    flex-direction: row;
    justify-content: center;
    padding: 0;
    width: 100%;
  }
  
  .home__content {
    margin-left: 240px;
    margin-right: 300px;
    width: 100%; 
    max-width: 700px;
    flex: 1;
    padding: 0 20px;
  }
  
  .feed-tabs {
    position: fixed;
    top: 0;
    left: 240px;
    right: 300px;
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
    background: rgba(9, 12, 18, 0.9);
  }
}
"""
home = re.sub(r'@media \(min-width: 1024px\) \{.*', new_media, home, flags=re.DOTALL)
with open(home_path, "w") as f:
    f.write(home)

# 3. Fix RightSidebar mobile hiding
rs_path = "intel-ui/src/components/RightSidebar/RightSidebar.jsx"
if os.path.exists(rs_path):
    with open(rs_path, "r") as f:
        rs = f.read()
    if 'className="desktop-only"' not in rs:
        rs = rs.replace('<aside style={{', '<aside className="desktop-only" style={{')
        with open(rs_path, "w") as f:
            f.write(rs)

