import { getText } from '../../lib/text';

const text = async (req, res) => {
  res.send(await getText());
};

export default text;
