import React from 'react';
import jsTokens from 'js-tokens';
import { convert } from 'hangul-romanization';

import { getText } from '../lib/text';

const Home = ({ title: initialTitle, url: initialUrl, text: initialText }) => {
  const [title, setTitle] = React.useState(initialTitle);
  const [url, setUrl] = React.useState(initialUrl);
  const [text, setText] = React.useState(initialText);

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
        ({ value }) => value
      );
      const tokenizedAnswer = Array.from(
        jsTokens(answer),
        ({ value }) => value
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
          answerToken,
          match: answerToken.toLowerCase() === romanizationToken.toLowerCase(),
        });
      }

      setMatchResult(result);
    }
  };

  const handleReload = async () => {
    const { title, url, text } = await fetch('/api/text').then(res =>
      res.json()
    );

    setTitle(title);
    setUrl(url);
    setText(text);
    setAnswer('');
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
          </a>{' '}
          ·{' '}
          <span className="cursor-pointer" onClick={handleReload}>
            ↻
          </span>
        </div>
        <div className="w-full mt-2 text-3xl">
          {Array.from(jsTokens(text), ({ value }, index) => (
            <span
              key={index}
              className={
                matchResult
                  ? matchResult[index] && matchResult[index].match
                    ? 'text-green-800'
                    : 'text-red-800'
                  : 'text-black'
              }
            >
              {value}
            </span>
          ))}
        </div>
      </div>

      {matchResult ? (
        <div className="p-4 w-full min-h-[228px] text-xl">
          {matchResult.map(({ answerToken, match }) => (
            <span
              key={answerToken}
              className={match ? 'text-green-800' : 'text-red-800'}
            >
              {answerToken}
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
  return {
    props: await getText(),
  };
}

export default Home;
