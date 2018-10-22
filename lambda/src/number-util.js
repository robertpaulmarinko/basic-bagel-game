

exports.getRandomNumber = (randumFuncReplacement) => {
    // 150 FOR 1=1 TO 3:
    // 160 A(I)=INT(10*RND)
    // 170 FOR J=1 TO I-1
    // 180 IF A(I)=A(J) THEN 160
    // 190 NEXT J
    // 200 NEXT I

    const randumFunc = randumFuncReplacement ? randumFuncReplacement : Math.random;
    const getRandomNum = (max) => Math.floor(randumFunc() * (max + 1));

    let digits = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let randomNumber = "";
    for(let i = 0; i < 3; i++ ) {
        let digitPosition = getRandomNum(digits.length - 1);
        randomNumber += digits.splice(digitPosition, 1);
    }

    return randomNumber;
}


exports.guessHasDuplicateDigits = (guess) => {
    // 320 IF B(1)=B(2) THEN 650
    // 330 IF B(2)=B(3) THEN 650
    // 340 IF B(3)=B(1) THEN 650 
    // ...
    // 650 PRINT "OH .. I FORGOT TO TELL YOUT THAT THE NUMBER I HAVE IN"
    // 660 PRINT "MIND HAS NO TWO DIGITS THE SAME. ": GOTO 230

    return guess[0] === guess[1] ||
           guess[1] === guess[2] ||
           guess[2] === guess[0];
}

exports.getResponse = (guess, target) => {
    // 350 C=0: D=0
    // 360 FOR J=l TO 2
    // 370 IF A(J) <> B(J+1) THEN 390
    // 380 C=C+1
    // 390 IF A(J+1) <> B(J) THEN 410
    // 400 C=C+1
    // 410 NEXT J
    // 420 IF A(1)<>B(3) THEN 440
    // 430 C=C+1
    // 440 IF A(3)<>B(1) THEN 460
    // 450 C=C+l
    // 460 FOR J=1 TO 3
    // 470 IF A(J) <> B(J) THEN 490
    // 480 D=D+1
    // 490 NEXT J
    // 500 IF D=3 THEN 680
    // 510 FOR J=1 TO C
    // 530 PRINT "PICO ";
    // 540 NEXT J
    // 550 FOR J=l TO D
    // 560 PRINT "FERMI ";
    // 570 NEXT J
    // 580 IF C+D <> 0 THEN 608 
    // 590 PRINT "bagels"
    // 600 PRINT
    // ...
    // 680 PRINT "YOU GOT IT!": PRINT
    let picoCount = 0;
    let fermiCount = 0;
    let result = "";

    for (let i = 0; i < 2; i++) {
      if (guess[i] === target[i+1]) picoCount++;
      if (guess[i+1] === target[i]) picoCount++;
    }
    if (guess[0] === target[2]) picoCount++;
    if (guess[2] === target[0]) picoCount++;
    for (let i = 0; i < 3; i++) {
      if (guess[i] === target[i]) fermiCount++;
    }
    if (fermiCount === 3) {
      // Shoud never happen
      result = "Correct!";
    } else {
      if (picoCount + fermiCount === 0) {
        result = "bagels";
      } else {
        for (i = 0; i < picoCount; i++) result += "pico ";
        for (i = 0; i < fermiCount; i++) result += "fermi ";
      }
    }

    return result.trim();
}
