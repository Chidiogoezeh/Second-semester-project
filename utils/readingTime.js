export const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const numberOfWords = text.split(/\s/g).length;
    const minutes = numberOfWords / wordsPerMinute;
    return Math.ceil(minutes);
};