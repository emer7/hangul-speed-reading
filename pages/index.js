import React from 'react';
import { convert } from 'hangul-romanization';
import jsTokens from 'js-tokens';

const Home = ({ title, url, text }) => {
  const [answer, setAnswer] = React.useState('');
  const handleAnswerChange = e => {
    const { value } = e.target;

    setAnswer(value);
  };

  const [matchResult, setMatchResult] = React.useState();
  const handleButtonClick = () => {
    if (matchResult) {
      setMatchResult();
    } else {
      const romanized = convert(text);
      const tokenizedRomanization = Array.from(
        jsTokens(romanized),
        token => token.value
      );
      const tokenizedAnswer = Array.from(
        jsTokens(answer),
        token => token.value
      );

      const length = Math.min(
        tokenizedRomanization.length,
        tokenizedAnswer.length
      );

      const result = [];

      for (let index = 0; index < length; index++) {
        const romanizationToken = tokenizedRomanization[index];
        const answerToken = tokenizedAnswer[index];

        result.push({
          token: answerToken,
          match: answerToken.toLowerCase() === romanizationToken,
        });
      }

      setMatchResult(result);
    }
  };

  return (
    <div className="flex flex-col px-32 justify-center space-y-8 min-h-screen bg-[#f7f5f1]">
      <div>
        <div className="text-xs">
          {title} ·{' '}
          <a
            className="underline"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            ko.wikipedia.org
          </a>
        </div>
        <div className="w-full mt-2 text-3xl">{text}</div>
      </div>

      {matchResult ? (
        <div className="p-4 w-full min-h-[228px] text-xl">
          {matchResult.map(({ token, match }) => (
            <span className={match ? 'text-green-800' : 'text-red-800'}>
              {token}
            </span>
          ))}
        </div>
      ) : (
        <textarea
          className="resize-none p-4 w-full bg-transparent focus:outline-none text-xl"
          placeholder="Type here"
          rows="7"
          onChange={handleAnswerChange}
          value={answer}
        />
      )}

      <div className="flex justify-end">
        <button
          className="border-2 border-black py-1 px-3 hover:bg-[#454443] hover:text-[#f7f5f1]"
          onClick={handleButtonClick}
        >
          {matchResult ? 'fix' : 'check'}
        </button>
      </div>
    </div>
  );
};

export async function getServerSideProps() {
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
    props: {
      title,
      url: `https://ko.wikipedia.org/wiki/${encodedTitle}`,
      text: page.extract,
    },
  };
}

export default Home;
