export const getRandomParagraph = (paragraphs) => {
  const index = Math.floor(Math.random() * paragraphs.length);
  return paragraphs[index];
};

const findFirstChangedIndex = (currentInput, nextInput) => {
  let index = 0;

  while (
    index < currentInput.length &&
    index < nextInput.length &&
    currentInput[index] === nextInput[index]
  ) {
    index += 1;
  }

  return index;
};

const isAppendingFromEnd = (currentInput, nextInput, changedIndex) =>
  changedIndex === currentInput.length && nextInput.length > currentInput.length;

const findInvalidWordBoundary = (targetText, nextInput, changedIndex) => {
  for (let index = changedIndex; index < nextInput.length; index += 1) {
    const isTypedSpace = nextInput[index] === ' ';
    const isExpectedSpace = targetText[index] === ' ';
    const skipsExpectedSpace = isExpectedSpace && !isTypedSpace;

    if (!isTypedSpace && !skipsExpectedSpace) {
      continue;
    }

    const wordStart = targetText.lastIndexOf(' ', index - 1) + 1;
    const typedWord = nextInput.slice(wordStart, index);
    const expectedWord = targetText.slice(wordStart, index);
    const isWordCorrect = typedWord === expectedWord;

    if (!isExpectedSpace || !isTypedSpace || !isWordCorrect) {
      return {
        index,
        shouldShake: isExpectedSpace && isTypedSpace && !isWordCorrect
      };
    }
  }

  return null;
};

export const getInputUpdate = (targetText, currentInput, proposedInput) => {
  const nextInput = proposedInput.slice(0, targetText.length);
  const changedIndex = findFirstChangedIndex(currentInput, nextInput);

  if (!isAppendingFromEnd(currentInput, nextInput, changedIndex)) {
    return { input: nextInput, shouldShake: false };
  }

  const invalidBoundary = findInvalidWordBoundary(targetText, nextInput, changedIndex);
  if (!invalidBoundary) {
    return { input: nextInput, shouldShake: false };
  }

  return {
    input: nextInput.slice(0, invalidBoundary.index),
    shouldShake: invalidBoundary.shouldShake
  };
};

export const calculateProgress = (inputLength, targetLength) =>
  Math.min(100, Math.round((inputLength / targetLength) * 100));

export const calculateWpm = (inputLength, elapsedMs) => {
  if (elapsedMs <= 0) {
    return 0;
  }

  return Math.round((inputLength / 5) / (elapsedMs / 60000));
};
