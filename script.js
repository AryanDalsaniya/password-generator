const passwordOutput = document.querySelector("#password-output");
const lengthSlider = document.querySelector("#length-slider");
const lengthValue = document.querySelector("#length-value");
const generateButton = document.querySelector("#generate-button");
const copyButton = document.querySelector("#copy-button");
const formMessage = document.querySelector("#form-message");
const strengthTrack = document.querySelector(".strength__track");
const strengthFill = document.querySelector(".strength__fill");
const strengthText = document.querySelector("#strength-text");

const characterSets = [
  { id: "include-uppercase", characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  { id: "include-lowercase", characters: "abcdefghijklmnopqrstuvwxyz" },
  { id: "include-numbers", characters: "0123456789" },
  { id: "include-symbols", characters: "!@#$%^&*()-_=+[]{};:,.?/" },
];

let copyFeedbackTimer;

function getSelectedSets() {
  const skipAmbiguous = document.querySelector("#exclude-ambiguous").checked;
  const ambiguousCharacters = /[iloO01]/g;

  return characterSets
    .filter(({ id }) => document.querySelector(`#${id}`).checked)
    .map(({ id, characters }) => ({
      id,
      characters: skipAmbiguous
        ? characters.replace(ambiguousCharacters, "")
        : characters,
    }))
    .filter(({ characters }) => characters.length > 0);
}

function randomIndex(maxExclusive) {
  const limit = 256 - (256 % maxExclusive);
  const byte = new Uint8Array(1);

  do {
    crypto.getRandomValues(byte);
  } while (byte[0] >= limit);

  return byte[0] % maxExclusive;
}

function shuffle(characters) {
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [characters[index], characters[swapIndex]] = [
      characters[swapIndex],
      characters[index],
    ];
  }
}

function createPassword() {
  const selectedSets = getSelectedSets();

  if (selectedSets.length === 0) {
    throw new Error("Choose at least one character type.");
  }

  const length = Number(lengthSlider.value);
  const pool = selectedSets.map(({ characters }) => characters).join("");
  const password = selectedSets.map(({ characters }) =>
    characters[randomIndex(characters.length)],
  );

  while (password.length < length) {
    password.push(pool[randomIndex(pool.length)]);
  }

  shuffle(password);
  return { value: password.join(""), poolSize: pool.length, length };
}

function updateStrength(length, poolSize) {
  const entropy = length * Math.log2(poolSize);
  const level = entropy < 35 ? 1 : entropy < 60 ? 2 : entropy < 80 ? 3 : 4;
  const labels = ["Weak", "Fair", "Good", "Great"];

  strengthTrack.dataset.level = String(level);
  strengthTrack.setAttribute("aria-valuenow", String(level));
  strengthFill.style.width = `${level * 25}%`;
  strengthText.textContent = labels[level - 1];
}

function copyWithFallback(value) {
  const temporaryInput = document.createElement("textarea");
  temporaryInput.value = value;
  temporaryInput.setAttribute("readonly", "");
  temporaryInput.style.position = "fixed";
  temporaryInput.style.opacity = "0";
  document.body.append(temporaryInput);

  try {
    temporaryInput.select();
    if (!document.execCommand("copy")) {
      throw new Error("Copy is not available in this browser.");
    }
  } finally {
    temporaryInput.remove();
  }
}

async function copyPassword() {
  const value = passwordOutput.textContent;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
    } else {
      copyWithFallback(value);
    }
  } catch (error) {
    if (navigator.clipboard && window.isSecureContext) {
      copyWithFallback(value);
    } else {
      throw error;
    }
  }

  clearTimeout(copyFeedbackTimer);
  copyButton.title = "Copied!";
  copyButton.setAttribute("aria-label", "Password copied");
  formMessage.dataset.kind = "success";
  formMessage.textContent = "Copied to clipboard.";
  copyFeedbackTimer = setTimeout(() => {
    copyButton.title = "Copy password";
    copyButton.setAttribute("aria-label", "Copy password");
    formMessage.textContent = "";
    delete formMessage.dataset.kind;
  }, 2000);
}

function generatePassword() {
  try {
    const password = createPassword();
    passwordOutput.textContent = password.value;
    passwordOutput.classList.remove("is-placeholder");
    copyButton.disabled = false;
    formMessage.textContent = "";
    delete formMessage.dataset.kind;
    copyButton.title = "Copy password";
    copyButton.setAttribute("aria-label", "Copy password");
    clearTimeout(copyFeedbackTimer);
    updateStrength(password.length, password.poolSize);
  } catch (error) {
    delete formMessage.dataset.kind;
    formMessage.textContent =
      error instanceof Error
        ? error.message
        : "Could not generate a password. Please try again.";
  }
}

lengthSlider.addEventListener("input", () => {
  lengthValue.value = lengthSlider.value;
});

generateButton.addEventListener("click", generatePassword);
copyButton.addEventListener("click", async () => {
  try {
    await copyPassword();
  } catch (error) {
    formMessage.textContent =
      error instanceof Error
        ? error.message
        : "Could not copy the password. Please try again.";
  }
});
