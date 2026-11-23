/*global document, window, history, localStorage, fetch*/
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    var ENDPOINT = "https://api.slapform.com/bxP4Ia1GB";
    var STORAGE_KEY = "feedbackFormData";
    var openBtn = document.getElementById("openBtn");
    var closeBtn = document.getElementById("closeBtn");
    var modal = document.getElementById("modal");
    var form = document.getElementById("fbForm");
    var statusEl = document.getElementById("status");
    var fields = ["fio", "email", "phone", "org", "msg"];

    function saveDraft() {
        var data = {};
        var i;
        for (i = 0; i < fields.length; i += 1) {
            data[fields[i]] = document.getElementById(fields[i]).value;
        }
        data.agree = document.getElementById("agree").checked;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function loadDraft() {
        var raw = localStorage.getItem(STORAGE_KEY);
        var data;
        var i;
        if (!raw) {
            return;
        }
        data = JSON.parse(raw);
        for (i = 0; i < fields.length; i += 1) {
            if (data[fields[i]]) {
                document.getElementById(fields[i]).value = data[fields[i]];
            }
        }
        document.getElementById("agree").checked = Boolean(data.agree);
    }

    function openModal(pushState) {
        modal.hidden = false;
        statusEl.textContent = "";
        if (pushState) {
            history.pushState({ modalOpen: true }, "", "#feedback");
        }
    }

    function closeModal() {
        modal.hidden = true;
    }

    loadDraft();

    openBtn.addEventListener("click", function () {
        openModal(true);
    });

    closeBtn.addEventListener("click", function () {
        closeModal();
        if (window.location.hash === "#feedback") {
            history.back();
        }
    });

    window.addEventListener("popstate", function () {
        closeModal();
    });

    form.addEventListener("input", saveDraft);
    form.addEventListener("change", saveDraft);

    form.addEventListener("submit", function (event) {
        var payload = {
            fio: document.getElementById("fio").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            org: document.getElementById("org").value,
            message: document.getElementById("msg").value,
            agree: document.getElementById("agree").checked
        };
        event.preventDefault();
        statusEl.textContent = "Отправка...";

        fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        }).then(function (response) {
            if (!response.ok) {
                throw new Error("Ошибка отправки");
            }
            return response.json();
        }).then(function () {
            statusEl.textContent = "Сообщение успешно отправлено!";
            form.reset();
            localStorage.removeItem(STORAGE_KEY);
        }).catch(function () {
            statusEl.textContent = "Ошибка при отправке. Проверьте адрес формы и сеть.";
        });
    });
});