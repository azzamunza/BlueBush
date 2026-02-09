# **BlueBush Project Roadmap: AI Training Dataset**

**Objective:** Create a "World Class" synthetic dataset and strategic report for an eco-friendly AI customer service agent.

**Brand:** BlueBush (Perth-based, Sustainable Homewares).

## **Phase 1: Architecture & Standards (The Foundation)**

*This phase defines the rules the AI must follow.*

* \[ \] **1\. Finalize Brand Identity**  
  * \[x\] Name: **BlueBush** (CamelCase).  
  * \[x\] Location: Forrestfield/Perth, WA.  
  * \[x\] Vibe: Down-to-earth, "Neutral Professional" Australian.  
* \[ \] **2\. Define "Gold Standard" Data Schema**  
  * \[x\] Update JSON structure to separate **Dynamic Data** (Price, Stock) from **Static Data** (Dimensions).  
  * \[x\] Implement **Content Triage** (Marketing Copy vs. Technical Specs).  
  * \[x\] Add **RAG Resources** field (Manual excerpts, Care Instructions).  
  * \[ \] **Action:** Create a template entry for one product in every category (Textile, Tech, Consumable) to ensure the schema fits all types.

## **Phase 2: Data Engineering (The Heavy Lift)**

*This phase involves generating the 70+ item "Deep Data" catalog based on the Gold Standard Schema.*

* \[ \] **3\. Generate Textile Data (Bedroom & Living)**  
  * \[ \] Research & Write: GSM weights, Thread Counts, Weave types.  
  * \[ \] Research & Write: "Linen Shedding" disclaimers and care instructions.  
* \[ \] **4\. Generate Hard Goods Data (Dining & Kitchen)**  
  * \[ \] Research & Write: Microwave/Dishwasher safety boolean flags.  
  * \[ \] Research & Write: "Thermal Shock" warnings for stoneware.  
* \[ \] **5\. Generate Consumable Data (Beauty & Cleaning)**  
  * \[ \] Research & Write: Full Ingredient Lists (checking for Palm Oil/Gluten).  
  * \[ \] Research & Write: "Detox Phase" warnings for shampoo bars/deodorant.  
  * \[ \] Research & Write: Pregnancy/Pet safety flags (Essential Oil specific).  
* \[ \] **6\. Generate Wellness Tech Data**  
  * \[ \] Research & Write: Battery capacities and charging times (Solar vs USB).  
  * \[ \] Research & Write: Troubleshooting Manual excerpts (e.g., "Cleaning the oscillator disc").  
* \[ \] **7\. Compile Master Catalog**  
  * \[ \] Merge all categories into one single bluebush\_master\_inventory.json file containing \~70 items with full metadata.

## **Phase 3: Operational Safeguards (The "Brain")**

*This phase ensures the data actually solves business problems.*

* \[ \] **8\. FAQ Gap Analysis**  
  * \[ \] Review the generated data against the "Frequently Asked Questions" list.  
  * \[ \] **Check:** Do we have the answer to "Is it pregnancy safe?" for every relevant item?  
  * \[ \] **Check:** Do we have dimensions for shipping questions?  
* \[ \] **9\. Document Risk Safeguards**  
  * \[ \] Finalize the "Risk Assessment" document.  
  * \[ \] Explicitly map "Competitor Failures" (e.g., Phantom Stock) to "BlueBush Solutions" (e.g., Real-time buffer logic).

## **Phase 4: Training Assets (The "Voice")**

*This phase prepares the examples used to fine-tune the model's style.*

* \[ \] **10\. Finalize Interaction Dataset**  
  * \[ \] Review the 50-item JSON (Q\&A pairs).  
  * \[ \] **Update:** Ensure the answers in these examples match the new "Deep Data" (e.g., if the manual says "hold for 10 seconds," the chat example must say that too).  
* \[ \] **11\. Define System Prompts**  
  * \[ \] Write the core System Instruction based on **ICE-AUS** and **UWA Corpus** research (Neutral Professional, no caricatures).

## **Phase 5: Final Report & Strategy**

*This phase compiles the academic/business justification.*

* \[ \] **12\. Draft "RAG Architecture" Section**  
  * \[ \] Explain why Price/Stock is separated (The "Frozen in Time" Paradox).  
  * \[ \] Explain how "Content Triage" prevents marketing fluff in support chats.  
* \[ \] **13\. Draft "Strategic Risk Mitigation" Section**  
  * \[ \] Detail how the dataset prevents "Greenwashing" and "Subscription Traps."  
* \[ \] **14\. Draft "Data Limitations" Section**  
  * \[ \] Acknowledge the need for Synthetic Data Amplification (turning 50 examples into 500).  
  * \[ \] Discuss Context Window constraints and Metadata tagging.

## **Phase 6: Final Review**

* \[ \] **15\. Final Polish**  
  * \[ \] Check all JSON files for syntax errors.  
  * \[ \] Ensure "BlueBush" spelling is consistent across all docs.