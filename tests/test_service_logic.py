import unittest

from src.sa_webworks_service import (
    LeadScore,
    classify_lead,
    entropy_score,
    estimate_revenue,
    recommend_action,
    score_lead,
)


class ServiceLogicTests(unittest.TestCase):
    def test_hot_lead_scoring(self):
        score = score_lead(
            {
                "budget_aud": 15000,
                "urgency": "emergency",
                "service_type": "lead_automation",
                "suburb": "Adelaide",
            }
        )
        self.assertEqual(score.band, "hot")
        self.assertGreaterEqual(score.value, 75)

    def test_out_of_area_rejection(self):
        rejected, reason = classify_lead({"suburb": "Perth"})
        self.assertTrue(rejected)
        self.assertEqual(reason, "out_of_service_area")

    def test_revenue_estimate_defaults_when_budget_missing(self):
        value = estimate_revenue({"service_type": "seo_growth"}, LeadScore(value=65, band="warm"), False)
        self.assertEqual(value, int(2500 * 0.7))

    def test_revenue_zero_for_rejected(self):
        value = estimate_revenue({"budget_aud": 12000}, LeadScore(value=90, band="hot"), True)
        self.assertEqual(value, 0)

    def test_recommendation_paths(self):
        self.assertIn("60s", recommend_action("hot", "emergency"))
        self.assertIn("3 days", recommend_action("warm", None))
        self.assertIn("14 days", recommend_action("cold", None))

    def test_entropy_score_bounds(self):
        high_entropy = entropy_score({"service_type": "x"}, True)
        low_entropy = entropy_score(
            {
                "name": "A",
                "email": "a@a.com",
                "phone": "1",
                "suburb": "Adelaide",
                "service_type": "blocked_drain",
                "urgency": "this_month",
            },
            False,
        )
        self.assertGreater(high_entropy, low_entropy)


if __name__ == "__main__":
    unittest.main()
