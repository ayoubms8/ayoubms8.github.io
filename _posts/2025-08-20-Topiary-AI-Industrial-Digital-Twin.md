---
title: Topiary - AI-Powered Industrial Digital Twin
date: 2025-08-20 12:00:00 +0100
categories: [AI, Hackathon, Industry]
tags: [Python, FastAPI, React, Machine Learning, Digital Twin, LLM, OCP, "1337"]
render_with_liquid: true
---

# Introduction :

A **Digital Twin** is a real-time virtual replica of a physical system — a software model that mirrors the state, behavior, and performance of its physical counterpart using live sensor data. When paired with AI, a Digital Twin can not only simulate the system but also predict its future state and recommend optimized operating parameters, transforming passive monitoring into active intelligence.

# Context :

Topiary was built during a 48-hour AI hackathon co-organized by **OCP Group** (one of the world's largest phosphate producers) and **1337 school**. The challenge was to apply AI to real industrial problems faced by OCP's chemical plants. Our team tackled energy optimization at a **Sulfuric Acid plant** — a critical part of OCP's phosphoric acid production chain.

In a sulfuric acid plant, burning sulfur generates intense heat. This heat produces high-pressure steam, which feeds a set of **Turbo-Alternator Groups (GTAs)** that generate electrical power for the facility. The core operational challenge: given a fixed amount of incoming sulfur, how should steam be distributed across the three GTAs to maximize total electricity output?

Answering this question in real-time, at scale, with a natural language interface — that was Topiary.

# System Architecture :

    ┌───────────────────────────────────────────────────────┐
    │                     TOPIARY                           │
    │                                                       │
    │  ┌─────────────────┐      ┌────────────────────────┐  │
    │  │  React Frontend  │◄────►│   FastAPI Backend      │  │
    │  │  (Vite + Tailwind│      │   (Python)             │  │
    │  │   Dashboard)     │      │                        │  │
    │  └─────────────────┘      │  ┌──────────────────┐  │  │
    │                           │  │ Digital Twin      │  │  │
    │                           │  │ (RandomForest ML) │  │  │
    │                           │  └──────────────────┘  │  │
    │                           │  ┌──────────────────┐  │  │
    │                           │  │ Optimizer         │  │  │
    │                           │  │ (Random Search)   │  │  │
    │                           │  └──────────────────┘  │  │
    │                           │  ┌──────────────────┐  │  │
    │                           │  │ LLM Assistant    │  │  │
    │                           │  │ (Qwen 2.5 local) │  │  │
    │                           │  └──────────────────┘  │  │
    │                           │  ┌──────────────────┐  │  │
    │                           │  │ SMS Alerts        │  │  │
    │                           │  │ (Twilio API)      │  │  │
    │                           │  └──────────────────┘  │  │
    │                           └────────────────────────┘  │
    └───────────────────────────────────────────────────────┘

| Component | Technology | Role |
|---|---|---|
| **Frontend** | React + Vite + Tailwind CSS | Real-time operator dashboard |
| **Backend** | FastAPI (Python) | REST API, model inference, orchestration |
| **Digital Twin** | scikit-learn RandomForest | Predicts plant output from input parameters |
| **Optimizer** | Random Search algorithm | Finds optimal GTA steam distribution |
| **AI Assistant** | Qwen 2.5 (via LM Studio) | Natural language operator guidance |
| **Alerting** | Twilio SMS API | Critical parameter alerts to operators |
| **Infrastructure** | Docker Compose | One-command deployment of all services |

# Walkthrough :

:one: The Dataset and the Problem :

OCP provided us with a real industrial dataset (`Data_Final.csv`) — historical sensor readings from the sulfuric acid plant covering sulfur input rates, steam admission values for each GTA, power output per turbine, and steam pressures.

The key relationships in the data:

    # Key plant variables:
    # Input:
    #   Total_Sulfur  → tons/hour of sulfur entering the plant
    #   Adm GTA1/2/3 → steam admission (T/h) to each turbo-alternator
    #
    # Output (what we predict):
    #   P GTA1/2/3   → electrical power (MW) from each GTA
    #   P GTAA/B     → auxiliary turbine power
    #   Pression vap MP1 → medium-pressure steam (critical safety param)
    #   S TR1/2/3    → steam flow through each turbine

The first insight from EDA: the total steam available is approximately proportional to sulfur input. We computed the **steam ratio** directly from the data:

    steam_ratio = (Adm_GTA1 + Adm_GTA2 + Adm_GTA3) / Total_Sulfur
    # Median value learned from historical data: ~2.2

This becomes the key constraint in the optimizer: for a given sulfur input, total steam distributed across GTAs cannot exceed `sulfur_in × steam_ratio`.

:two: Training the Digital Twin (ML Model) :

We trained a **Multi-Output Random Forest Regressor** — a single model that simultaneously predicts all 12 output variables from the 4 input variables. Random Forest was chosen because:
- It handles nonlinear plant dynamics well
- It is robust to noisy sensor data
- It works with step-function outputs (turbines have discrete operational states)
- No hyperparameter tuning needed to get a useful baseline quickly (critical in a 48-hour hackathon)

    from sklearn.ensemble import RandomForestRegressor
    from sklearn.multioutput import MultiOutputRegressor

    model = MultiOutputRegressor(
        RandomForestRegressor(n_estimators=50, random_state=42)
    )

    # Input features: [Total_Sulfur, Adm_GTA1, Adm_GTA2, Adm_GTA3]
    # Output targets: [P_GTA1, P_GTA2, P_GTA3, P_GTAA, P_GTAB,
    #                  MP_Pressure, TR1, TR2, TR3, Sout1, Sout2, Sout3]
    model.fit(X_train, y_train)

The trained model becomes the **heart of the Digital Twin** — given any proposed set of operating parameters, it instantly returns the predicted plant state, allowing us to evaluate thousands of configurations in milliseconds.

:three: The Optimization Engine :

The Digital Twin answers "what *would* the plant produce with these settings?" The optimizer answers "what settings *should* we use to maximize output?"

We implemented a **Random Search** optimizer — at each iteration, it samples a random valid distribution of steam across the three GTAs (respecting the total steam constraint), queries the Digital Twin for predicted power, and keeps the best:

    def solve_random_search(sulfur_in, n_iter=1000):
        max_steam = sulfur_in * sim.steam_ratio
        best_power = -1.0
        best_adm = [0, 0, 0]

        for _ in range(n_iter):
            r = np.random.rand(3)
            proposal = (r / r.sum()) * max_steam   # normalize to total steam budget
            proposal = np.clip(proposal, 0, 220)   # physical valve limits

            # Re-enforce total steam constraint after clipping
            if proposal.sum() > max_steam:
                proposal = proposal * (max_steam / proposal.sum())

            pwr = predict_total_power(sulfur_in, *proposal)
            if pwr > best_power:
                best_power = pwr
                best_adm = proposal

        return best_adm, best_power

Why Random Search over gradient descent? Random Forests produce step-function outputs — gradients are zero almost everywhere, making gradient-based methods ineffective. Random Search is simple, parallelizable, and works well with 3 continuous variables over 1000 iterations.

:four: The LLM Operator Assistant :

Raw numbers are not enough for industrial operators on a shift. We integrated a **locally running Qwen 2.5** language model (served via LM Studio) to translate the optimizer's output into actionable natural language instructions:

    # The optimizer finds: optimal_adm = [145.3, 88.1, 62.6]
    # Current state:       current_adm  = [120.0, 95.0, 85.0]
    # Predicted gain:      +4.7 MW

    # The LLM is prompted with this context and responds:
    # "Increase GTA1 admission from 120 to 145 T/h, reduce GTA3 from 85 to 63 T/h.
    #  Expected gain: +4.7 MW. GTA2 remains near current setpoint."

The LLM was also exposed via a chat endpoint, allowing operators to ask questions about live plant data in natural language — a conversational interface to the Digital Twin.

:five: Critical Safety Alerting (Twilio) :

One of the most important features for an industrial system is **real-time alerting**. We integrated the Twilio SMS API to send automatic alerts when critical plant parameters breach safety thresholds:

    # In the /simulate endpoint, after every prediction:
    if result['MP_Pressure'] < 7.5:   # Medium-Pressure steam below safe threshold
        twilio_client.messages.create(
            body=f"CRITICAL ALERT: MP Pressure Low ({result['MP_Pressure']:.2f} bar). "
                 f"Check GTA Load immediately.",
            from_=TWILIO_FROM_NUMBER,
            to=TWILIO_TO_NUMBER
        )

This means an operator away from the control room receives an SMS within seconds of the simulated — or real — system entering a critical state.

:six: Deployment with Docker Compose :

The entire application was containerized for one-command deployment — essential in a hackathon environment where judges need to run the project without manual environment setup:

    # One command to launch everything:
    docker-compose up --build

    # Services started:
    # - backend  → FastAPI on http://localhost:8000 (host network mode)
    # - frontend → React/Vite dev server on http://localhost:5173

The backend uses `network_mode: host` to allow it to reach the LM Studio local LLM server on `localhost:1234` without complex Docker networking.

# Questions and answers

:question: What is a Digital Twin and how is it different from a simulation?

> A traditional simulation is a standalone model run to explore scenarios — it is disconnected from the real world. A Digital Twin is a model that is **continuously synchronized** with a real physical system via live sensor data. It mirrors the current state of the physical system in real-time, allowing operators to monitor what is happening, predict what will happen, and test "what-if" scenarios against the real system state without risk. Topiary creates the simulation layer; in a production deployment, it would be connected to the plant's SCADA/DCS via an API to receive live sensor readings.

:question: Why use a Random Forest instead of a physics-based model for the Digital Twin?

> A physics-based (first-principles) model of a sulfuric acid plant would require deep thermodynamic domain knowledge, weeks of calibration, and validated mass-energy balances. In a 48-hour hackathon, this was not feasible. A Random Forest trained on historical data captures the real input-output relationships of the plant — including non-ideal behaviors, wear, and calibration drift — without requiring an equation for every physical process. The tradeoff is that it cannot extrapolate beyond the training data distribution, but for operating within normal parameters it is highly effective.

:question: Why was Qwen 2.5 run locally via LM Studio instead of using an API like GPT-4?

> Two reasons: cost and data privacy. Industrial plant data is commercially sensitive — sending it to an external API endpoint creates a data governance risk. Running the LLM locally via LM Studio means all data stays within the local network. Additionally, for a hackathon demo, local inference avoids API rate limits and network latency. The `LLM_BASE_URL` environment variable is abstracted, so the same code can point to any OpenAI-compatible API endpoint in production.

:question: Why is Random Search effective for optimizing a Random Forest's output?

> Random Forest models are piecewise constant — they partition the input space into rectangular regions and predict the same value for all points in a region. This means the output surface has no gradients; gradient-based optimizers like SGD or Adam would get stuck immediately. Random Search uniformly explores the input space and is guaranteed to find a good solution given enough iterations. With only 3 continuous inputs (GTA1, GTA2, GTA3) and a 1000-iteration budget, it finds near-optimal solutions in milliseconds on any modern CPU.

:question: What would be needed to deploy Topiary in a real production environment?

> Several additions would be required: (1) **Real-time data ingestion** — connecting the backend to the plant's SCADA/DCS system via OPC-UA or a REST/MQTT gateway to replace manual input with live sensor streams. (2) **Model retraining pipeline** — as the plant ages and operating conditions drift, the model needs to be retrained periodically on fresh data. (3) **Authentication and access control** — the API endpoints must be secured. (4) **Redundancy and failover** — industrial systems require high availability. (5) **Model monitoring** — tracking prediction drift to detect when the model is no longer accurate.

# Ressources :

* scikit-learn MultiOutputRegressor : https://scikit-learn.org/stable/modules/generated/sklearn.multioutput.MultiOutputRegressor.html
* FastAPI Documentation : https://fastapi.tiangolo.com/
* LM Studio (Local LLM Serving) : https://lmstudio.ai/
* Qwen 2.5 Model : https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
* Twilio SMS API : https://www.twilio.com/docs/sms
* Digital Twin Concept (IBM) : https://www.ibm.com/topics/what-is-a-digital-twin
* OCP Group : https://www.ocpgroup.ma/
* GitHub Repository : https://github.com/ayoubms8/Topiary
