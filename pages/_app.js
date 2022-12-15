import { createTheme, NextUIProvider } from '@nextui-org/react';
import styles from "../styles/index.module.css"
import styled from "../styles/globals.css"

function MyApp({ Component, pageProps }) {

  return (
    <NextUIProvider className={styles.containerLogin}>
      <Component {...pageProps} />
    </NextUIProvider>
  )
}

export default MyApp
