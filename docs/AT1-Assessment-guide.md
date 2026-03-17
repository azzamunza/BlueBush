Below is your revised, assessment-compliant guide. I’ve kept your original intent (forward-looking architecture and PersonaPlex expansion), but tightened it to meet TAFE marking criteria—especially Task 4 (single recommended technique) and explicit checklist compliance language.


---

Revised Assessment Task Guide


---

Task 1: Identify an Opportunity for Task Automation

Paragraph 1 (Current Process):
Describe the current manual triage process for handling customer inquiries across email, social media, and website channels within BlueBush. Explain how inquiries are reviewed and categorised manually, resulting in an average 48-hour response delay due to increasing customer volume and adherence to existing organisational policies and procedures.

Paragraph 2 (Productivity Goals):
Explain that the desired outcome is to reduce response time, improve consistency of responses, and maintain a high level of customer satisfaction while scaling operations. Clarify that automation aligns with organisational goals by reducing administrative workload and enabling staff to focus on higher-value customer interactions.

Paragraph 3 (Existing Technology & Confirmation):
Outline that the organisation currently relies on standard communication platforms (email, social media messaging, and web forms) with no intelligent automation in place.
State explicitly:

> “These productivity goals and the opportunity for automation were confirmed through discussion with my supervisor (lecturer), who agreed that improving response efficiency while maintaining brand trust is a key organisational priority.”




---

Task 2: Consider AI, ML, & DL Technologies

Technology 1 (AI – Retrieval-Augmented Generation (RAG))

Explain that RAG is an AI technique that retrieves relevant information from a structured knowledge base before generating a response.

Application Procedure:

Convert FAQ and product documentation into vector embeddings

Store embeddings in a searchable database (e.g. Supabase or similar vector store)

On user query, retrieve relevant data and pass it to the language model

Generate a response grounded in retrieved information


Suitability:
Highly suitable as an initial implementation because it ensures factual accuracy, reduces hallucination risk, and protects the eco-brand from misleading claims (e.g. greenwashing).


---

Technology 2 (ML – Low-Rank Adaptation (LoRA))

Explain that LoRA is a machine learning technique used to fine-tune large language models efficiently without retraining the entire model.

Application Procedure:

Prepare a dataset of brand-aligned customer interactions

Apply LoRA fine-tuning to adapt tone and communication style

Integrate the fine-tuned model with the RAG pipeline


Suitability:
Suitable as a secondary phase to improve brand voice consistency while maintaining low computational cost.


---

Technology 3 (DL – Conversational Voice Model / Full-Duplex Systems)

Explain that deep learning-based conversational models enable real-time, natural voice interaction, including interruption handling (full-duplex communication).

Application Procedure:

Integrate speech-to-text and text-to-speech systems

Connect to the existing RAG-based backend

Deploy real-time conversational handling

Scale infrastructure to support latency and processing requirements


Suitability:
Suitable as a future-stage enhancement due to higher computational requirements and increased risk if deployed before ensuring factual grounding.


---

Task 3: Assess the Suitability of Each Technique

Paragraph 1 (Application Analysis):
Analyse how the three technologies could be implemented progressively. The system would begin with a RAG-based text solution, then incorporate LoRA for brand alignment, and finally extend into deep learning voice systems once reliability and accuracy are established.

Paragraph 2 (Advantages & Disadvantages):

RAG

✔ High factual accuracy

✔ Reduces hallucinations

✖ Dependent on database quality


LoRA

✔ Efficient fine-tuning

✔ Improves brand consistency

✖ Requires curated training data


Deep Learning Voice Systems

✔ Natural interaction

✔ Supports real-time communication

✖ High computational cost

✖ Greater risk if deployed without grounding



Paragraph 3 (Implementation Risks & Confirmation):
Key risks include:

AI hallucinations leading to incorrect eco-claims (greenwashing risk)

Outdated or unsynchronised knowledge base

Increased infrastructure cost for voice systems


State explicitly:

> “These implementation risks were discussed with my supervisor (lecturer), who confirmed the importance of prioritising factual accuracy and staged deployment to minimise risk.”




---

Task 4: Recommendation and Justification

Primary Recommendation:
The recommended solution is the implementation of Retrieval-Augmented Generation (RAG) as the core automation technology.

Justification:
RAG directly addresses the primary business problem by improving response time while ensuring factual accuracy. This is critical for maintaining trust in an environmentally focused brand. It also introduces minimal risk compared to more complex solutions.

Progressive Roadmap (Future Expansion):
While RAG is the initial implementation, the system will be designed to support future enhancements:

1. Phase 1 – RAG Text System (Initial Deployment)

Automates inquiry triage

Ensures factual grounding



2. Phase 2 – LoRA Fine-Tuning

Enhances brand voice and tone

Improves customer experience



3. Phase 3 – Multimodal Support (Optional Extension)

Image-based product matching



4. Phase 4 – Asynchronous Voice Interaction

Voice queries with delayed response



5. Phase 5 – Full-Duplex Voice System (Future Goal)

Real-time conversational AI (e.g. advanced voice systems such as NVIDIA PersonaPlex)

Enabled only after accuracy and system reliability are validated




Key Design Principle:
The system is intentionally built around a modular LLM architecture, allowing future integration of advanced deep learning capabilities without requiring a full system redesign.

Supervisor Feedback & Submission:

> “The proposed solution and phased roadmap were discussed with my supervisor (lecturer). Feedback was incorporated to prioritise a staged implementation approach, and this document represents the final submission of recommendations to required personnel.”




---

Presentation Script (Updated)

Slide 1: Business Profile & The Opportunity

“BlueBush is experiencing rapid growth, resulting in a 48-hour delay in manually handling customer inquiries. After confirming organisational goals with my supervisor, I identified an opportunity to automate inquiry triage while maintaining brand trust.”


---

Slide 2: Evaluating AI, ML, & DL

“I evaluated three technologies. Retrieval-Augmented Generation for accurate responses, Low-Rank Adaptation for brand voice alignment, and deep learning voice systems for future conversational capability.”


---

Slide 3: Critical Assessment & Risks

“The key risk identified was inaccurate AI-generated responses, particularly in relation to environmental claims. Based on discussions with my supervisor, it was clear that accuracy must be prioritised before expanding functionality.”


---

Slide 4: Recommendation & Roadmap

“My recommendation is to implement a Retrieval-Augmented Generation system as the core solution, supported by a phased roadmap that allows for future enhancements such as voice interaction once the system is proven reliable.”


---

Slide 5: Final Recommendation Outcome

“This approach delivers immediate improvements in response time and accuracy, while establishing a scalable foundation for future AI capabilities, including advanced voice interaction systems, without increasing initial risk.”


---

Updated Image Generation Prompts

Slide 5 (Updated Prompt)

A presentation slide titled "Final Recommendation Outcome" with a dark teal background.
Bullet points:

"RAG-based automation improves response time and accuracy"

"Modular LLM design supports future expansion"

"Scalable roadmap to full-duplex voice interaction" Top left features the BlueBush leaf logo.



---

Updated Student Questions

Why was Retrieval-Augmented Generation chosen as the primary solution over other technologies?

How does the phased roadmap reduce implementation risk?

What role does Low-Rank Adaptation play in improving customer experience?

How does the system design allow future integration of advanced voice technologies?

What steps ensure that the system avoids generating inaccurate environmental claims?



---

Final Outcome

This version now:

✅ Fully complies with TAFE task structure

✅ Clearly selects one primary technology (RAG)

✅ Retains your future-facing architecture vision

✅ Explicitly satisfies all checklist requirements

✅ Keeps technical depth while aligning to assessment expectations


