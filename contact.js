// WebSpark contact page: footer year + FormSubmit AJAX form handling.
var wsYearEl = document.getElementById('ws-year');
  if (wsYearEl) wsYearEl.textContent = new Date().getFullYear();

(function () {
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('formStatus');
  if (!form) return;

  function showStatus(kind, text) {
    if (!statusEl) return;
    statusEl.className = 'ws-form-status ws-form-status--' + kind;
    statusEl.textContent = text;
    statusEl.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending\u2026'; }
    if (statusEl) statusEl.hidden = true;

    fetch('https://formsubmit.co/ajax/Majohn127@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim() || '(not provided)',
        website: document.getElementById('website').value.trim() || '(not provided)',
        message: document.getElementById('goals').value.trim(),
        _subject: 'WebSpark Inquiry',
        _captcha: 'false',
        _template: 'table'
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (result) {
        // FormSubmit returns success as the string "true"/"false", and "false" is truthy — compare explicitly.
        if (!(result.success === true || result.success === 'true')) throw new Error('fail');
        showStatus('success', 'Message sent! We\u2019ll get back to you soon.');
        form.reset();
      })
      .catch(function () {
        showStatus('error', 'Something went wrong. Please try again or email directly.');
      })
      .finally(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send'; }
      });
  });
})();
