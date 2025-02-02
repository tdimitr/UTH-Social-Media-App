import { Box, useColorModeValue } from '@chakra-ui/react';

const Footer = () => {
  const textColor = useColorModeValue('gray.600', 'whiteAlpha.700');
  const bgColor = useColorModeValue('gray.100', '#101010');

  return (
    <Box
      as='footer'
      w='full'
      py={0.5}
      textAlign='center'
      color={textColor}
      bg={bgColor}
      mt='auto'
    >
      Built by <strong>Tsapalas Dimitrios-Nikolaos</strong> © 2025
    </Box>
  );
};

export default Footer;
