import React, { useState, useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import { motion } from "motion/react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useColorMode } from "@docusaurus/theme-common";

interface RotatingDisplayProps {
  items: React.ReactNode[];
  autoRotateInterval?: number;
  className?: string;
}

const RotatingDisplay: React.FC<RotatingDisplayProps> = ({
  items,
  autoRotateInterval = 5000,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === "dark";

  const nextItem = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const prevItem = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (!isAutoRotating) return;

    const interval = setInterval(nextItem, autoRotateInterval);
    return () => clearInterval(interval);
  }, [isAutoRotating, autoRotateInterval]);

  const handleManualNavigation = (navFunction: () => void) => {
    setIsAutoRotating(false);
    navFunction();
    
    // Resume auto-rotation after 10 seconds of inactivity
    setTimeout(() => {
      setIsAutoRotating(true);
    }, 10000);
  };

  const getItemIndex = (offset: number) => {
    const index = currentIndex + offset;
    if (index < 0) return items.length + index;
    return index % items.length;
  };

  return (
    <Box
      className={className}
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        px: 4,
      }}
    >
      {/* Left Arrow */}
      <IconButton
        onClick={() => handleManualNavigation(prevItem)}
        sx={{
          position: "absolute",
          left: 8,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 3,
          bgcolor: isDarkTheme 
            ? "rgba(130, 177, 255, 0.15)" 
            : "rgba(255, 255, 255, 0.95)",
          color: isDarkTheme ? "#82b1ff" : "#0066cc",
          backdropFilter: "blur(8px)",
          border: isDarkTheme 
            ? "1px solid rgba(130, 177, 255, 0.3)" 
            : "1px solid rgba(0, 102, 204, 0.3)",
          boxShadow: isDarkTheme 
            ? "0 4px 12px rgba(0, 0, 0, 0.3)" 
            : "0 4px 12px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            bgcolor: isDarkTheme 
              ? "rgba(130, 177, 255, 0.25)" 
              : "rgba(255, 255, 255, 1)",
            transform: "translateY(-50%) scale(1.05)",
          },
          transition: "all 0.2s ease",
        }}
        size="small"
      >
        <ArrowBackIosIcon fontSize="small" />
      </IconButton>

      {/* Carousel Container */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          height: 500, // Fixed height
          mx: 6,
          overflow: "visible",
        }}
      >
        {/* Previous Item (Left Partial) */}
        <motion.div
          key={`prev-${getItemIndex(-1)}`}
          animate={{
            x: "-45%",
            scale: 0.75,
            opacity: 0.5,
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: 0,
            zIndex: 1,
            transformOrigin: "center",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: 400, // Fixed width for side items
              height: 400, // Fixed height for side items
              overflow: "hidden",
              position: "relative",
              "& > *": {
                width: "100% !important",
                height: "100% !important",
                "& > *": {
                  transform: "scale(0.85)",
                  transformOrigin: "top left",
                },
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: "70%",
                background: isDarkTheme
                  ? "linear-gradient(to right, transparent, rgba(17, 17, 17, 0.95))"
                  : "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.95))",
                zIndex: 2,
              },
            }}
          >
            {items[getItemIndex(-1)]}
          </Box>
        </motion.div>

        {/* Current Item (Center Focus) */}
        <motion.div
          key={`current-${currentIndex}`}
          animate={{
            x: 0,
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
          }}
          style={{
            position: "relative",
            zIndex: 2,
            width: 550, // Wider main item
            height: 450, // Fixed height for main item
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              "& > *": {
                width: "100% !important",
                height: "100% !important",
              },
            }}
          >
            {items[currentIndex]}
          </Box>
        </motion.div>

        {/* Next Item (Right Partial) */}
        <motion.div
          key={`next-${getItemIndex(1)}`}
          animate={{
            x: "45%",
            scale: 0.75,
            opacity: 0.5,
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            right: 0,
            zIndex: 1,
            transformOrigin: "center",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: 400, // Fixed width for side items
              height: 400, // Fixed height for side items
              overflow: "hidden",
              position: "relative",
              "& > *": {
                width: "100% !important",
                height: "100% !important",
                "& > *": {
                  transform: "scale(0.85)",
                  transformOrigin: "top left",
                },
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: "70%",
                background: isDarkTheme
                  ? "linear-gradient(to left, transparent, rgba(17, 17, 17, 0.95))"
                  : "linear-gradient(to left, transparent, rgba(255, 255, 255, 0.95))",
                zIndex: 2,
              },
            }}
          >
            {items[getItemIndex(1)]}
          </Box>
        </motion.div>
      </Box>

      {/* Right Arrow */}
      <IconButton
        onClick={() => handleManualNavigation(nextItem)}
        sx={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 3,
          bgcolor: isDarkTheme 
            ? "rgba(130, 177, 255, 0.15)" 
            : "rgba(255, 255, 255, 0.95)",
          color: isDarkTheme ? "#82b1ff" : "#0066cc",
          backdropFilter: "blur(8px)",
          border: isDarkTheme 
            ? "1px solid rgba(130, 177, 255, 0.3)" 
            : "1px solid rgba(0, 102, 204, 0.3)",
          boxShadow: isDarkTheme 
            ? "0 4px 12px rgba(0, 0, 0, 0.3)" 
            : "0 4px 12px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            bgcolor: isDarkTheme 
              ? "rgba(130, 177, 255, 0.25)" 
              : "rgba(255, 255, 255, 1)",
            transform: "translateY(-50%) scale(1.05)",
          },
          transition: "all 0.2s ease",
        }}
        size="small"
      >
        <ArrowForwardIosIcon fontSize="small" />
      </IconButton>

      {/* Progress indicators */}
      <Box
        sx={{
          position: "absolute",
          bottom: -32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1.5,
        }}
      >
        {items.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: index === currentIndex 
                ? (isDarkTheme ? "#82b1ff" : "#0066cc")
                : (isDarkTheme ? "rgba(130, 177, 255, 0.3)" : "rgba(0, 102, 204, 0.3)"),
              transition: "all 0.3s ease",
              cursor: "pointer",
              "&:hover": {
                transform: "scale(1.2)",
              },
            }}
            onClick={() => {
              setCurrentIndex(index);
              handleManualNavigation(() => {});
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default RotatingDisplay;