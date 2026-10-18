# Architecture rules
- Signup form validation calls the public validate-email function before Cloud Auth; it is not a server-enforced Auth hook, because managed hook configuration is unavailable through current tools.
- Guided labs share the lab experiment registry and simulation dispatcher so procedures, quizzes and routes remain consistent.
- Offline queue mutations are serialized and acknowledgements remove only the sent entry revision, preventing concurrent autosaves from disappearing.