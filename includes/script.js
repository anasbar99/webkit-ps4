let timerId = null;
const label = document.getElementById('autoJbLabelText');
const checkbox = document.getElementById('autoJbInput');
const jeilbrekBtn = document.getElementById('jeilbrek');
const stopExploitBtn = document.getElementById('stop-exploit');
const UAElement = document.getElementById('UA');
const consoleStatus = document.getElementById('console-status');
const consoleStatusText = document.getElementById('console-status-text');
const consoleOutput = document.getElementById('console');

const storedAutoJb = localStorage.getItem('autoJb');
let autoJbValue = storedAutoJb !== null ? storedAutoJb === 'true' : true;

function setConsoleStatus(state) {
  consoleStatus.classList.remove('is-on', 'is-running', 'is-done');
  consoleStatus.classList.add(`is-${state}`);
  consoleStatusText.textContent = state === 'running' ? 'Berjalan' : state === 'done' ? 'Selesai' : 'On';
  stopExploitBtn.disabled = state !== 'running';
}

// choose one of kernel exploits
var exploitChain = localStorage.getItem('exploitChain') || 'lapse';
const netctrlRadio = document.getElementById('netctrl-exploit');
const lapseRadio = document.getElementById('lapse-exploit');
const kexForm = document.getElementById('kernel-options');
const dpadLabels = document.querySelectorAll('.autoJb label, .segmented-control label');

window.jailbreakStopRequested = false;

// Show user agent
UAElement.innerText += ' ' + navigator.userAgent;

kexForm.addEventListener('change', function (event) {
  localStorage.setItem('exploitChain', event.target.value);
  exploitChain = event.target.value;
});

// jailbreak execution
jeilbrekBtn.addEventListener('click', function (e) {
  window.jailbreakStopRequested = false;
  jeilbrekBtn.disabled = true;
  stopExploitBtn.disabled = false;
  stopInterval();
  setConsoleStatus('running');
  doJb();
});

stopExploitBtn.addEventListener('click', function () {
  window.jailbreakStopRequested = true;
  localStorage.setItem('autoJb', 'false');
  stopInterval();
  consoleOutput.append('Jailbreak Stopped.\n');
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
  setConsoleStatus('on');
  jeilbrekBtn.disabled = false;
  stopExploitBtn.disabled = true;
  label.textContent = 'Auto Jailbreak';

  setTimeout(function () {
    location.reload();
  }, 1200);
});

checkbox.addEventListener('change', function () {
  localStorage.setItem('autoJb', checkbox.checked);
  if (checkbox.checked == true && jeilbrekBtn.disabled == false) {
    jailbreakCountdown();
    return;
  }

  stopInterval();
});

function stopInterval() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
  label.textContent = 'Auto Jailbreak';
}

function activateExploitRadio(radio) {
  radio.checked = true;
  const changeEvent = document.createEvent('Event');
  changeEvent.initEvent('change', true, false);
  radio.dispatchEvent(changeEvent);
}

function primeExploitSelection() {
  const targetRadio = exploitChain === 'netctrl' ? netctrlRadio : lapseRadio;
  const warmupRadio = targetRadio === lapseRadio ? netctrlRadio : lapseRadio;

  activateExploitRadio(warmupRadio);
  setTimeout(function () {
    activateExploitRadio(targetRadio);
  }, 120);
}

function jailbreakCountdown() {
  stopInterval();

  let countdown = 5;
  label.textContent = `Auto Jailbreaking in: ${countdown}`;
  timerId = setInterval(() => {
    countdown--;
    label.textContent = `Auto Jailbreaking in: ${countdown}`;

    if (countdown < 0) {
      window.jailbreakStopRequested = false;
      jeilbrekBtn.disabled = true;
      stopExploitBtn.disabled = false;
      clearInterval(timerId);
      timerId = null;
      label.textContent = 'Executing';
      setConsoleStatus('running');
      doJb();
    }
  }, 1000);
}

function cacheProgress(e) {
  var Percent = Math.round((e.loaded / e.total) * 100);
  document.title = 'Caching: ' + Percent + '%';
}

function displayCacheProgress() {
  setTimeout(function () {
    // show a tick
    document.title = '\u2713';
  }, 1000);
  setTimeout(function () {
    // location.reload();
    document.title = 'PS4 JAILBREAK';
  }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
  // Cache handling
  if (window.applicationCache) {
    window.applicationCache.addEventListener('progress', cacheProgress, false);
    window.applicationCache.oncached = function (e) {
      displayCacheProgress();
    };
    window.applicationCache.onupdateready = function (e) {
      displayCacheProgress();
    };
  }

  // choose prefered exploit chain
  if (exploitChain == 'netctrl') {
    activateExploitRadio(netctrlRadio);
  } else {
    activateExploitRadio(lapseRadio);
  }

  // apply autojb localStorage value
  checkbox.checked = autoJbValue;

  if (autoJbValue) {
    primeExploitSelection();
    setTimeout(function () {
      if (checkbox.checked && !jeilbrekBtn.disabled) jailbreakCountdown();
    }, 1800);
  }
});

dpadLabels.forEach(function (control) {
  control.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      control.click();
    }
  });
});
