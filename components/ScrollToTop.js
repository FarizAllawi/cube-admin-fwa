import { Button } from "@nextui-org/react";
import React, { useState, useEffect } from "react";

import styles from '../styles/components/Scroll.module.css'

const ScrollToTop = () => {
    const [showTopBtn, setShowTopBtn] = useState(false);
    useEffect(() => {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 400) {
                setShowTopBtn(true);
            } else {
                setShowTopBtn(false);
            }
        });
    }, []);
    const goToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };
    return (
        <div className={styles.toptobtm}>

        <button
            className={styles.iconstyle}
            onClick={goToTop}
            >
            ^
            </button>
        </div>
    );
};
export default ScrollToTop;