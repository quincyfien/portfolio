---
title: "Lessons from Building a Malware Classification System"
date: "2026-07-08"
category: "Cybersecurity"
tags: ["Machine Learning", "Python", "Data Science"]
summary: "An overview of feature engineering and classifier selection when training machine learning algorithms to detect malicious executables."
readTime: "5 min read"
---

### The Challenge
Modern antivirus solutions struggle to keep up with the volume of polymorphic malware variants generated daily. Standard signature-based detection can be bypassed with minor code obfuscations. In this project, I explore how static feature extraction combined with machine learning classification can identify novel threat binaries.

### Extracting Static Features
Static analysis inspects binary files without executing them. I focused on extracting features from the **Portable Executable (PE) headers** of Windows binaries from the Microsoft Malware Dataset:

- **Section Entropy**: Obfuscated or encrypted sections typically display higher entropy scores.
- **API Call Density**: Tracking imported libraries (e.g., `Kernel32.dll` or `Advapi32.dll`).
- **Header Section Sizes**: Discrepancies between virtual sizes and raw data sizes.

Here is the general architecture used to prepare dataset matrices for classification:

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Load PE header features
df = pd.read_csv("pe_header_dataset.csv")

# Extract features and targets
X = df.drop(["hash", "label"], axis=1)
y = df["label"]

# Normalize feature sets
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

### Comparing Classifiers
I benchmarked two primary machine learning architectures:
1. **Support Vector Machines (SVM)**: Excellent for high-dimensional feature spaces, though training time increases with dataset sizes.
2. **Artificial Neural Networks (MLP)**: Outstanding at capturing complex non-linear correlations, though prone to overfitting without adequate regularization.

The Neural Network converged on a **94.2% accuracy rate** on the testing dataset, while SVM showed stronger consistency on obfuscated samples.

### Key Discoveries
- **Feature Selection Matters**: Stripping out noisy, non-informative header metadata improved classifier performance and halved model training times.
- **Handling Polymorphism**: Machine learning is highly effective at recognizing structural structural patterns that signature databases miss.
