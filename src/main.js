import flatpickr from 'flatpickr';
import iziToast from 'izitoast';
import 'flatpickr/dist/flatpickr.min.css';
import 'izitoast/dist/css/iziToast.min.css';

const currentPage = document.body.dataset.page;

if (currentPage === 'timer') {
  initTimerPage();
}

if (currentPage === 'snackbar') {
  initSnackbarPage();
}

function initTimerPage() {
  const startButton = document.querySelector('[data-start]');
  const dateTimePicker = document.querySelector('#datetime-picker');
  const timerFields = {
    days: document.querySelector('[data-days]'),
    hours: document.querySelector('[data-hours]'),
    minutes: document.querySelector('[data-minutes]'),
    seconds: document.querySelector('[data-seconds]'),
  };

  let userSelectedDate = null;
  let timerId = null;

  startButton.disabled = true;
  updateTimerFace(timerFields, { days: 0, hours: 0, minutes: 0, seconds: 0 });

  const picker = flatpickr(dateTimePicker, {
    enableTime: true,
    time_24hr: true,
    defaultDate: new Date(),
    minuteIncrement: 1,
    onClose(selectedDates) {
      const selectedDate = selectedDates[0];

      if (!selectedDate || selectedDate <= new Date()) {
        userSelectedDate = null;
        startButton.disabled = true;
        iziToast.error({
          message: 'Please choose a date in the future',
          position: 'topRight',
        });
        return;
      }

      userSelectedDate = selectedDate;
      startButton.disabled = false;
    },
  });

  startButton.addEventListener('click', () => {
    if (!userSelectedDate) {
      return;
    }

    startButton.disabled = true;
    dateTimePicker.disabled = true;
    picker.close();

    updateTimerFace(timerFields, convertMs(userSelectedDate - new Date()));

    timerId = setInterval(() => {
      const timeLeft = userSelectedDate - new Date();

      if (timeLeft <= 0) {
        clearInterval(timerId);
        updateTimerFace(timerFields, {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        dateTimePicker.disabled = false;
        startButton.disabled = true;
        userSelectedDate = null;
        return;
      }

      updateTimerFace(timerFields, convertMs(timeLeft));
    }, 1000);
  });
}

function initSnackbarPage() {
  const form = document.querySelector('.form');

  form.addEventListener('submit', event => {
    event.preventDefault();

    const formData = new FormData(form);
    const delay = Number(formData.get('delay'));
    const state = formData.get('state');

    createPromise(delay, state)
      .then(value => {
        iziToast.success({
          message: `✅ Fulfilled promise in ${value}ms`,
          position: 'topRight',
        });
      })
      .catch(value => {
        iziToast.error({
          message: `❌ Rejected promise in ${value}ms`,
          position: 'topRight',
        });
      });

    form.reset();
  });
}

function createPromise(delay, state) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (state === 'fulfilled') {
        resolve(delay);
        return;
      }

      reject(delay);
    }, delay);
  });
}

function updateTimerFace(elements, values) {
  elements.days.textContent = addLeadingZero(values.days);
  elements.hours.textContent = addLeadingZero(values.hours);
  elements.minutes.textContent = addLeadingZero(values.minutes);
  elements.seconds.textContent = addLeadingZero(values.seconds);
}

function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}
