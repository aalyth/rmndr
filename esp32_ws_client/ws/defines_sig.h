#ifndef DEF_SIG_H
#define DEF_SIG_H

// here we define the methods of signaling

#include <LiquidCrystal_I2C.h>
#define i2c_lcd_addr 0x27
LiquidCrystal_I2C lcd(i2c_lcd_addr, 16, 2);
#define BUZZER 19

#endif
