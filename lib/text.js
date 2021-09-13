export const getText = async () => {
  const {
    query: {
      random: [random],
    },
  } = await fetch(
    'https://ko.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&list=random&rnnamespace=0&rnlimit=1'
  ).then(res => res.json());

  const { title } = random;
  const encodedTitle = encodeURIComponent(title);

  const {
    query: {
      pages: [page],
    },
  } = await fetch(
    `https://ko.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=extracts&titles=${encodedTitle}&explaintext&exchars=260&exsectionformat=plain`
  ).then(res => res.json());

  return {
    title,
    url: `https://ko.wikipedia.org/wiki/${encodedTitle}`,
    text: page.extract,
  };
};
