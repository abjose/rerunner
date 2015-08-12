// JS for rerunner extension. Adds a "select failures" button to the trybot
// popup window, so you don't have to select them by hand.

rerunner_HookTrybotLink(0);

// Hook into link to open trybot-popup
function rerunner_HookTrybotLink(attempts) {
  // find the most recent patchset
  var most_recent_patch = -1;
  var patch_containers = document.getElementsByClassName("rb-patchContainer");
  for (var i = 0; i < patch_containers.length; ++i) {
    var patch_number = parseInt(patch_containers[i].id.replace(/\D/g,''));
    if (patch_number) {
      if (patch_number > most_recent_patch) most_recent_patch = patch_number;
    }
  }
  if (most_recent_patch === -1) {
    // Stupid timeout-based retry.
    if (attempts < 3) {
      console.log("Rerunner unable to find most recent patch,",
                  "trying again soon...");
      setTimeout(function() { rerunner_HookTrybotLink(attempts+1); }, 300);
    } else {
      console.log("Rerunner unable to find most recent patch, giving up.");
    }
    return;
  }

  // Get the "Choose trybots" link element.
  var tryjobchange_link = 
    document.getElementById("tryjobchange-"+most_recent_patch);
  if (!tryjobchange_link) {
    console.log("Rerunner unable to find tryjobchange link.");
    return;
  }

  // Add "select failures" button to trybot-popup.
  var trybot_button_divs = document.getElementsByClassName("trybot-button-div");
  for (var i = 0; i < trybot_button_divs.length; ++i) {
    var btn = document.createElement("input");
    btn.type = "button";
    btn.value = "Select Failures";
    btn.onclick = function() { rerunner_SelectFailedBots(most_recent_patch); };
    trybot_button_divs[i].insertBefore(btn, trybot_button_divs[i].firstChild);
  }
}

function rerunner_SelectFailedBots(patch_number) {
  // Get all failures (only in desired patchset)
  var patch = document.getElementById("ps-"+patch_number);
  if (!patch) {
    console.log("Couldn't find most recent patch.");
    return;
  }
  var failures =
    patch.getElementsByClassName("build-result build-status-color-failure");

  // Extract trybot names from failures
  var failure_names = {};
  for (var i = 0; i < failures.length; ++i) {
    failure_names[failures[i].innerText.trim()] = true;
  }
  failure_names = Object.keys(failure_names);

  // We don't want to select a trybot if it has passed at any point, so grab
  // successes too.
  var successes =
    patch.getElementsByClassName("build-result build-status-color-success");
  var success_names = {};
  for (var i = 0; i < successes.length; ++i) {
    success_names[successes[i].innerText.trim()] = true;
  }

  // For each failure name, if it hasn't been a success before, check its box
  var trybot_popup = document.getElementById("trybot-popup");
  if (!trybot_popup) return;
  var labels = trybot_popup.getElementsByTagName("label");
  for (var i = 0; i < failure_names.length; ++i) {
    if (failure_names[i] in success_names) continue;
    // Have to manually check each label to see if the name matches...
    for (var j = 0; j < labels.length; ++j) {
      if (labels[j].innerText === failure_names[i]) {
        var checkbox_id = labels[j].attributes["for"].nodeValue;
        document.getElementById(checkbox_id).checked = true;;
        break;
      }
    }
  }
}
