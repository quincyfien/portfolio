export const projects = [
  {
    "id": "80f302b8-fdfe-4fd8-aef0-fd1746e55358",
    "title": "Point-of-Sale Credit Risk Prediction Pipeline",
    "description": "An end-to-end credit risk modeling pipeline and system architecture for thin-file retail lending, utilizing LightGBM and leak-free 5-Fold Stratified Cross-Validation to improve baseline ROC-AUC from 0.669 to 0.761 (+9.2%).",
    "longDescription": "Designed an automated credit scoring engine for point-of-sale consumer financing where instantaneous, millisecond underwriting decisions are required for thin-file applicants with no prior credit bureau history. Authored a comprehensive System Requirements and System Design Document detailing downstream API contracts, schema parity invariants, and defensive data validation before model training.\n\nKey Engineering Highlights\n\nData Hygiene & Anomaly Resolution: Handled domain-specific database sentinels (including the DAYS_EMPLOYED = 365243 placeholder for pensioners/unemployed) by converting them into missing values and engineering explicit missingness indicator flags to prevent tree split distortion.\n\nDomain Feature Engineering: Formulated financial interaction ratios including Debt Burden (AMT_CREDIT / AMT_INCOME_TOTAL), Payment Rate (AMT_ANNUITY / AMT_CREDIT), Loan-to-Value (AMT_CREDIT / AMT_GOODS_PRICE), and statistical aggregations (mean, min, max, std) across external credit bureau ratings.\n\nLeak-Free Validation Architecture: Built an automated 5-Fold Stratified Cross-Validation framework ensuring all encoding, transformations, and imputations were strictly fitted inside training folds to eliminate target leakage.\n\nDefensive Integrity Checks: Enforced runtime assertions validating row counts, schema alignment, missing prediction checks, and continuous probability bounds \n[\n0.0\n,\n1.0\n]\n[0.0,1.0].\n\nMeasurable Results\n\nBaseline ROC-AUC: 0.669 (Random Forest on 5 features)\n\nFinal Model Performance: 0.76064 Out-Of-Fold (OOF) ROC-AUC\n\nCross-Validation Stability: Fold Mean 0.76070 \n±\n± 0.00363 across all 5 test slices",
    "technologies": [
      "Python",
      "LightGBM",
      "Scikit-Learn",
      "Feature Engineering System",
      "Architecture",
      "Risk Modeling",
      "Cross-Validation"
    ],
    "features": [
      "Comprehensive 15-page System Design Document & API serving contract defined prior to model execution\nLeak-free 5-Fold Stratified Cross-Validation framework with automated out-of-fold scoring\nAutomated anomaly detection and sanitization for legacy database sentinels (e.g.",
      "DAYS_EMPLOYED = 365243)\nDomain financial feature engineering: Debt-to-Income",
      "Payment Rate",
      "and Loan-to-Value ratios\nStatistical aggregation engine synthesizing external credit bureau ratings (mean",
      "min",
      "max",
      "std)\nHigh-performance gradient boosting architecture using LightGBM with automated early stopping\nStrict pipeline isolation ensuring encoders and transformations fit exclusively on training folds\nDefensive runtime assertion layer validating row counts",
      "schema parity",
      "and probability bounds [0.0",
      "1.0]"
    ],
    "challengesSolved": "Database Sentinel Code Distortion:\nThe dataset contained legacy database placeholder codes like DAYS_EMPLOYED = 365243 (~1,000 years, indicating pensioners or unemployed applicants). Left unhandled, these distorted numeric scales and tree splits. Resolved this by replacing sentinels with null values and engineering an explicit binary anomaly indicator (DAYS_EMPLOYED_ANOM) to preserve the behavioral signal without skewing numerical distributions.\n\nSilent Data Leakage in Preprocessing:\nStandard starter workflows frequently fit encoders and imputers globally across the entire dataset prior to splitting, introducing data leakage and overly optimistic validation scores. Eliminated this risk by enforcing strict pipeline containment, fitting all categorical encoders and imputations strictly inside the training partitions of each fold during 5-Fold Stratified Cross-Validation \n\nLow Predictive Signal on Thin-File Borrowers:\nStatic application snapshots with only 32 features lacked historical repayment logs. Raw numbers (such as absolute income) failed to measure default risk effectively. Resolved this by engineering interaction ratios that capture relative credit burden—such as Payment Rate (AMT_ANNUITY / AMT_CREDIT) and Credit-to-Income—along with statistical summaries across external bureau scores, elevating the ROC-AUC from 0.669 to 0.761.",
    "lessonsLearned": "Navigating the Bayes Error Rate (Deterministic vs. Stochastic Systems):\nIn systems and software engineering, functionality is typically deterministic: code either succeeds or fails. In credit risk, human behavior is stochastic and subject to unrecorded future events (such as illness or job loss months after approval). Understanding irreducible error (the Bayes error bound) clarified why an AUC of 1.0 is a mathematical impossibility on static snapshot data, reframing the goal from chasing impossible metrics to maximizing reliable probabilistic separation (~0.76–0.78).\n\nSpecification-First Architecture:\nDrafting a complete System Design Document and formalizing input/output serving contracts before touching model code drastically reduced development friction. Establishing data invariants, non-goals, and schema constraints upfront prevented architectural errors during implementation.\n\nDefensive Machine Learning Pipelines:\nMachine learning models silently degrade if input shapes or outputs shift. Implementing automated sanity assertions—checking for schema parity, row counts (61,500), nulls, and continuous decimal ranges [0.0, 1.0]—ensured the final deliverable met deployment standards without risking broken downstream integrations.",
    "githubLink": "",
    "demoLink": "",
    "tags": [
      "Machine Learning / Fintech"
    ],
    "featured": false
  }
];
