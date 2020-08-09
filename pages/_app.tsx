import { AppProps, AppContext } from 'next/app';
import Error from 'next/error';
import App from 'next/app';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme, CssBaseline } from '@material-ui/core';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

/**
 * next.js application component
 */
const NextApp = ({ Component, pageProps }: AppProps) => {
  if (pageProps.isError) return <Error statusCode={404} />
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

/**
 * next.js initial props
 */
NextApp.getInitialProps = async (appContext: AppContext) => {
  const { ctx: { asPath, pathname }} = appContext;
  if (process.browser) {
    const verify = await fetch(asPath || pathname, { headers: { 'X-Verify-Page': pathname }});
    if (verify.status >= 400) {
      return { pageProps: { isError: true }};
    }
  }
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
}

export default NextApp;