# rerunner
Chromium extension for rerunning failed trybots.

Love abusing trybots? Hate selecting each failed bot by hand when you want to run them again? 

This extension adds an extra button, "Select Failures", to the "Choose trybots" pop-up window in Rietveld. When you click "Select Failures", the extension will automatically check the boxes for all trybots that have 1) failed at least once, and 2) never passed. Then just click "Update" as normal.
