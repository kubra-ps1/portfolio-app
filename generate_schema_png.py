import matplotlib.pyplot as plt
import matplotlib.patches as patches
import sys
import os

try:
    fig, ax = plt.subplots(figsize=(10, 8))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Background
    fig.patch.set_facecolor('#0f0c29')
    ax.set_facecolor('#0f0c29')

    tables = {
        "USERS": ["id (PK)", "name", "email", "password", "total_income", "total_expense", "net_balance"],
        "CATEGORIES": ["id (PK)", "name", "type"],
        "TRANSACTIONS": ["id (PK)", "user_id (FK)", "category_id (FK)", "item_name", "amount", "date"],
        "BUDGETS": ["id (PK)", "user_id (FK)", "category_id (FK)", "monthly_limit", "month_year"]
    }

    box_w = 38
    row_h = 4
    head_h = 6

    def draw_table(x, y, title, cols):
        h = head_h + len(cols) * row_h
        y0 = y - h
        
        # Base body
        rect = patches.Rectangle((x, y0), box_w, h, linewidth=2, edgecolor='#6c5ce7', facecolor='#1e1e2f', zorder=2)
        ax.add_patch(rect)
        
        # Header
        head_rect = patches.Rectangle((x, y0 + h - head_h), box_w, head_h, linewidth=2, edgecolor='#6c5ce7', facecolor='#6c5ce7', zorder=2)
        ax.add_patch(head_rect)
        
        # Title
        ax.text(x + box_w/2, y0 + h - head_h/2, title, color='white', fontsize=12, fontweight='bold', ha='center', va='center', zorder=3)
        
        # Columns
        for i, c in enumerate(cols):
            cy = y0 + h - head_h - (i + 0.5) * row_h
            ax.text(x + 2, cy, c, color='#dcdde1', fontsize=10, va='center', zorder=3)
            # line below
            ax.plot([x, x+box_w], [y0 + h - head_h - (i+1)*row_h, y0 + h - head_h - (i+1)*row_h], color='#2f3640', lw=1, zorder=3)
            
        return x, y0, box_w, h

    x_u, y_u, w_u, h_u = draw_table(5, 95, "USERS", tables["USERS"])
    x_c, y_c, w_c, h_c = draw_table(55, 95, "CATEGORIES", tables["CATEGORIES"])
    x_t, y_t, w_t, h_t = draw_table(5, 45, "TRANSACTIONS", tables["TRANSACTIONS"])
    x_b, y_b, w_b, h_b = draw_table(55, 45, "BUDGETS", tables["BUDGETS"])

    # Draw arrows
    ax.annotate("", xy=(24, 45), xytext=(24, y_u), arrowprops=dict(arrowstyle="->", color="#00cec9", lw=2))
    ax.text(25, 48, "1:N", color="#00cec9", fontsize=9)

    ax.annotate("", xy=(74, 45), xytext=(74, y_c), arrowprops=dict(arrowstyle="->", color="#00cec9", lw=2))
    ax.text(75, 48, "1:N", color="#00cec9", fontsize=9)

    ax.annotate("", xy=(55, y_b + h_b - 5), xytext=(5+w_u, y_u + h_u - 10), arrowprops=dict(arrowstyle="->", color="#00cec9", lw=2, connectionstyle="angle,angleA=0,angleB=90,rad=10"))
    ax.annotate("", xy=(5+w_t, y_t + h_t - 5), xytext=(55, y_c + h_c - 10), arrowprops=dict(arrowstyle="->", color="#00cec9", lw=2, connectionstyle="angle,angleA=180,angleB=90,rad=10"))

    out_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(out_dir, 'schema.png')
    plt.savefig(out_path, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor())
    print(f"\nSUCCESS: PNG schema has been created at {out_path} !\n")
except Exception as e:
    print(f"\nERROR: {e}\n")
    sys.exit(1)
