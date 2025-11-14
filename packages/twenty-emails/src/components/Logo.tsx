import { Img } from '@react-email/components';

const logoStyle = {
  marginBottom: '40px',
};

export const Logo = () => {
  // Use environment variable or fallback to localhost for development
  const baseUrl = process.env.SERVER_URL || 'http://localhost:3000';

  return (
    <Img
      src={`${baseUrl}/images/logos/logoicon.png`}
      alt="Swanson Industries logo"
      width="40"
      height="40"
      style={logoStyle}
    />
  );
};
