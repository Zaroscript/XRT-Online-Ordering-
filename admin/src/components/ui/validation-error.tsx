interface Props {
  message: string | undefined;
}

const ValidationError = ({ message }: Props) => {
  if (!message) return null;
  return <p className="my-2 text-sm text-start text-red-500">{message}</p>;
};

export default ValidationError;
