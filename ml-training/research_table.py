import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def create_research_table():
    """Create a clean research table for the paper"""
    
    # Performance metrics
    data = {
        'Model': ['Random Forest', 'Logistic Regression', 'Naive Bayes'],
        'Accuracy': [0.9565, 0.9025, 0.8190],
        'Precision': [0.9400, 0.8900, 0.8000],
        'Recall': [0.9300, 0.8800, 0.7900],
        'F1-Score': [0.9300, 0.8800, 0.7900],
        'Weighted F1': [0.9500, 0.9000, 0.8200]
    }
    
    df = pd.DataFrame(data)
    
    # Create a clean table visualization
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.axis('tight')
    ax.axis('off')
    
    # Create table
    table = ax.table(cellText=df.values,
                    colLabels=df.columns,
                    cellLoc='center',
                    loc='center',
                    bbox=[0, 0, 1, 1])
    
    # Style the table
    table.auto_set_font_size(False)
    table.set_fontsize(14)
    table.scale(1.2, 2)
    
    # Color the header
    for i in range(len(df.columns)):
        table[(0, i)].set_facecolor('#4CAF50')
        table[(0, i)].set_text_props(weight='bold', color='white')
    
    # Highlight best model (Random Forest)
    for i in range(len(df.columns)):
        table[(1, i)].set_facecolor('#E8F5E8')
        table[(1, i)].set_text_props(weight='bold')
    
    # Set title
    plt.title('Performance Metrics for Medical Chatbot Intent Classification\n(10,000 Training Samples, 6 Intent Categories)', 
              fontsize=16, fontweight='bold', pad=20)
    
    plt.savefig('research_performance_table.png', dpi=300, bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    plt.savefig('research_performance_table.pdf', bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    
    print("✅ Research table saved as:")
    print("   📊 research_performance_table.png")
    print("   📄 research_performance_table.pdf")
    
    # Print LaTeX table for research paper
    print("\n" + "="*80)
    print("LATEX TABLE FOR RESEARCH PAPER")
    print("="*80)
    print("\\begin{table}[h]")
    print("\\centering")
    print("\\caption{Performance Metrics for Medical Chatbot Intent Classification}")
    print("\\label{tab:performance_metrics}")
    print("\\begin{tabular}{|l|c|c|c|c|c|}")
    print("\\hline")
    print("Model & Accuracy & Precision & Recall & F1-Score & Weighted F1 \\\\")
    print("\\hline")
    for _, row in df.iterrows():
        print(f"{row['Model']} & {row['Accuracy']:.4f} & {row['Precision']:.4f} & {row['Recall']:.4f} & {row['F1-Score']:.4f} & {row['Weighted F1']:.4f} \\\\")
    print("\\hline")
    print("\\end{tabular}")
    print("\\end{table}")
    
    # Print markdown table
    print("\n" + "="*80)
    print("MARKDOWN TABLE FOR RESEARCH PAPER")
    print("="*80)
    print("| Model | Accuracy | Precision | Recall | F1-Score | Weighted F1 |")
    print("|-------|----------|-----------|--------|----------|-------------|")
    for _, row in df.iterrows():
        print(f"| {row['Model']} | {row['Accuracy']:.4f} | {row['Precision']:.4f} | {row['Recall']:.4f} | {row['F1-Score']:.4f} | {row['Weighted F1']:.4f} |")
    
    return df

if __name__ == "__main__":
    df = create_research_table()
