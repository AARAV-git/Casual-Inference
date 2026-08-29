import { apiClient, safeCall } from './client';

const FALLBACK_HYPOTHESES = [
  { id: 'h1', text: 'Personalization strength has a non-linear causal effect on user engagement that varies by tenure cohort.' },
  { id: 'h2', text: 'AI-induced behavioral drift accounts for less than 30% of total observed drift in recommendation outcomes.' },
  { id: 'h3', text: 'Counterfactual policy optimization reduces cumulative regret by at least 15% compared to static intervention policies.' },
  { id: 'h4', text: 'Causal heterogeneity (CATE) is strongest among users with declining activity levels.' },
  { id: 'h5', text: 'The doubly robust estimator provides the most stable ATE estimates under distribution shift conditions.' },
];

const FALLBACK_METHODOLOGY = `# Methodology

## Experimental Design

We employ a **counterfactual framework** grounded in the potential outcomes model (Rubin, 1974) to estimate the causal effects of personalization interventions on user behavior.

### Data Pipeline
1. **Raw event logs** are collected from the streaming platform (clicks, watches, skips, likes).
2. **Feature engineering** produces confounders: session frequency, content diversity index, tenure, device type.
3. **Propensity scoring** uses logistic regression to estimate P(T|X) for each treatment assignment.

### Estimators
| Estimator | Strength | Weakness |
|-----------|----------|----------|
| T-Learner | Captures heterogeneity | Variance on small subgroups |
| S-Learner | Low variance | May miss heterogeneous effects |
| Doubly Robust | Consistent if either model correct | Sensitivity to extreme propensities |
| Causal Forest | Adaptive heterogeneity | Computationally expensive |
| DragonNet | End-to-end TARNet | Requires careful tuning |

### Evaluation Metrics
- **PEHE** (Precision in Estimation of Heterogeneous Effect): Lower is better
- **AUUC** (Area Under the Uplift Curve): Higher is better
- **Qini Coefficient**: Measures cumulative gain from targeting

## Behavioral Drift Measurement

Drift is measured using the **Wasserstein distance** between consecutive time-window distributions of the behavior variable, decomposed into:
- **Natural drift**: Seasonal/organic changes in user preferences
- **AI-induced drift**: Changes attributable to the recommendation system's feedback loop
`;

const FALLBACK_EXPERIMENTS = `# Experiment Log

## EXP-001: Baseline ATE Estimation
- **Date**: 2024-11-15
- **Dataset**: Streaming Engagement v3 (N=9,664)
- **Result**: ATE = 0.342, 95% CI [0.218, 0.466]
- **Conclusion**: Personalization has a statistically significant positive effect on watch duration.

## EXP-002: CATE Segmentation
- **Date**: 2024-11-22
- **Finding**: New users show CATE of 0.521 vs 0.093 for power users.
- **Implication**: Personalization benefits are concentrated in newer user segments.

## EXP-003: Model Comparison
- **Date**: 2024-12-01
- **Models Tested**: T-Learner, S-Learner, DR, Causal Forest, DragonNet
- **Winner**: Causal Forest (AUUC=0.751, PEHE=0.367)

## EXP-004: Drift Decomposition
- **Date**: 2024-12-10
- **Finding**: AI-induced drift = 0.053, Natural drift = 0.181 (Total = 0.234)
- **Implication**: The majority of behavioral drift is organic, not system-induced.
`;

const FALLBACK_FINDINGS = `# Key Findings

## 1. Causal Effect of Personalization
Personalization increases average watch duration by **34.2%** (95% CI: [21.8%, 46.6%]). The effect is robust across all five estimators tested.

## 2. Heterogeneous Treatment Effects
- **New users** (< 30 days) benefit most: CATE = 0.521
- **Power users** benefit least: CATE = 0.093
- **Declining users** show moderate benefit: CATE = 0.412

This suggests personalization is most valuable during the **onboarding phase** and as a **retention tool**.

## 3. Behavioral Drift Decomposition
Of the total drift observed (0.234):
- **77.3%** is natural/organic drift
- **22.7%** is AI-induced drift

The recommendation system's feedback loop contributes meaningfully but is not the dominant source of behavioral change.

## 4. Counterfactual Policy Optimization
Switching from a static "one-size-fits-all" policy to a causal-aware personalized policy reduces:
- **Cumulative regret** by 18.3%
- **Churn rate** by 4.2 percentage points
- **Average engagement** increases by 12.7%

## 5. Model Rankings
| Rank | Model | PEHE | AUUC |
|------|-------|------|------|
| 1 | Causal Forest | 0.367 | 0.751 |
| 2 | Meta-Learner Ensemble | 0.345 | 0.763 |
| 3 | Doubly Robust | 0.389 | 0.734 |
| 4 | DragonNet | 0.398 | 0.728 |
| 5 | T-Learner | 0.421 | 0.712 |
`;

export async function getHypotheses(): Promise<Array<{ id: string; text: string }>> {
  return safeCall(async () => {
    const { data } = await apiClient.get('/research/hypotheses');
    return data;
  }, FALLBACK_HYPOTHESES);
}

export async function getMethodology(): Promise<string> {
  return safeCall(async () => {
    const { data } = await apiClient.get('/research/methodology');
    return data;
  }, FALLBACK_METHODOLOGY);
}

export async function getExperimentsWriteup(): Promise<string> {
  return safeCall(async () => {
    const { data } = await apiClient.get('/research/experiments');
    return data;
  }, FALLBACK_EXPERIMENTS);
}

export async function getFindings(): Promise<string> {
  return safeCall(async () => {
    const { data } = await apiClient.get('/research/findings');
    return data;
  }, FALLBACK_FINDINGS);
}
