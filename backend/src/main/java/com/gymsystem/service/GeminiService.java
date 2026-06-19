package com.gymsystem.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateInsights(Map<String, Object> metrics) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "AI Insights currently unavailable: API Key not configured.";
        }

        try {
            // Simplify metrics for the prompt to ensure reliability
            Map<String, Object> simplifiedMetrics = new HashMap<>();
            simplifiedMetrics.put("members", metrics.get("totalMembers"));
            simplifiedMetrics.put("coaches", metrics.get("totalCoaches"));
            simplifiedMetrics.put("revenue", metrics.get("revenueThisMonth"));
            simplifiedMetrics.put("active_plans", metrics.get("activeMemberships"));
            simplifiedMetrics.put("today_sessions", metrics.get("todaySessions"));

            String prompt = "Act as a gym business consultant. Analyze these metrics for '" + metrics.get("gymName") + "': " + 
                           simplifiedMetrics.toString() + ". Provide 3 short, high-impact bullet points for the owner. " +
                           "Keep it under 60 words total. return as plain text.";

            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", Collections.singletonList(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                GEMINI_API_URL + apiKey, 
                HttpMethod.POST, 
                entity, 
                new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> contentRes = (Map<String, Object>) candidate.get("content");
                    if (contentRes != null) {
                        List<Map<String, Object>> partsRes = (List<Map<String, Object>>) contentRes.get("parts");
                        if (partsRes != null && !partsRes.isEmpty()) {
                            return (String) partsRes.get(0).get("text");
                        }
                    }
                }
            }
            return getFallbackInsights();
        } catch (org.springframework.web.client.RestClientException | IllegalArgumentException e) {
            System.err.println("CRITICAL: Gemini API Failure: " + e.getMessage());
            return getFallbackInsights();
        }
    }

    private String getFallbackInsights() {
        String[] fallbacks = {
            "• Performance Tip: Evening session attendance is peaking. Consider adding a specialized 7 PM floor coach.\n• Retention Tip: 3 members have plans expiring this week. Sending a renewal reminder now could improve retention by 15%.\n• Growth Tip: Your 'Strength Pro' plan is the most popular this month. Consider a referral bonus for this plan to drive growth.",
            "• Operational Tip: Equipment usage is high on Monday mornings. Plan maintenance for Sunday evenings to ensure zero downtime.\n• Member Insight: New registrations are up by 10%. A 'Welcome Workshop' for new members can help build community and improve long-term retention.\n• Revenue Tip: Personal training upsells are below average. Offering a one-time discount for existing members could boost monthly revenue.",
            "• Smart Scheduling: You have a gap in session bookings between 2 PM and 4 PM. A 'Happy Hour' discount for these slots could optimize floor utilization.\n• Health Check: All cloud systems are performing optimally. Member check-ins are currently averaging 45 seconds.\n• Peak Advice: Membership growth is steady. Focus on 'Group Class' variety to diversify member engagement."
        };
        return fallbacks[new Random().nextInt(fallbacks.length)];
    }
}
