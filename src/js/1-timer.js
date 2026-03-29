import flatpickr from 'flatpickr';
import iziToast from 'izitoast';
import 'flatpickr/dist/flatpickr.min.css';
import 'izitoast/dist/css/iziToast.min.css';

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
updateTimerFace({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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

  updateTimerFace(convertMs(userSelectedDate - new Date()));

  timerId = setInterval(() => {
    const timeLeft = userSelectedDate - new Date();

    if (timeLeft <= 0) {
      clearInterval(timerId);
      updateTimerFace({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      dateTimePicker.disabled = false;
      startButton.disabled = true;
      userSelectedDate = null;
      return;
    }

    updateTimerFace(convertMs(timeLeft));
  }, 1000);
});

function updateTimerFace(values) {
  timerFields.days.textContent = addLeadingZero(values.days);
  timerFields.hours.textContent = addLeadingZero(values.hours);
  timerFields.minutes.textContent = addLeadingZero(values.minutes);
  timerFields.seconds.textContent = addLeadingZero(values.seconds);
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
