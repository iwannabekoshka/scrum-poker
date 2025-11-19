export const CARD_SCALES = {
  fibonacci: {
    key: 'fibonacci',
    label: 'Фибоначчи',
    values: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89']
  },
  fibonacciPlus: {
    key: 'fibonacciPlus',
    label: 'Фибоначчи+',
    values: ['0', '1', '2', '3', '5', '8', '13', '21', '40', '80', '100']
  },
  powerOfTwo: {
    key: 'powerOfTwo',
    label: 'Степень 2-ки',
    values: ['0', '1', '2', '4', '6', '8', '16', '32', '64']
  },
  linear: {
    key: 'linear',
    label: 'Линейная',
    values: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  }
};

export const DEFAULT_SCALE_KEY = 'fibonacci';

export const getScaleByKey = (scaleKey = DEFAULT_SCALE_KEY) => {
  return CARD_SCALES[scaleKey] || CARD_SCALES[DEFAULT_SCALE_KEY];
};

