const passwordOutput = document.querySelector("#password-output");
const lengthSlider = document.querySelector("#length-slider");
const lengthValue = document.querySelector("#length-value");
const generateButton = document.querySelector("#generate-button");
const copyButton = document.querySelector("#copy-button");
const formMessage = document.querySelector("#form-message");

const characterSets = [
  { id: "include-uppercase", characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  { id: "include-lowercase", characters: "abcdefghijklmnopqrstuvwxyz" },
  { id: "include-numbers", characters: "0123456789" },
  { id: "include-symbols", characters: "!@#$%^&*()-_=+[]{};:,.?/" },
];

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
  const selectedSets = characterSets.filter(({ id }) =>
    document.querySelector(`#${id}`).checked,
  );

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
  return password.join("");
}

function generatePassword() {
  try {
    passwordOutput.textContent = createPassword();
    passwordOutput.classList.remove("is-placeholder");
    copyButton.disabled = false;
    formMessage.textContent = "";
  } catch (error) {
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
