/**
 * Created by mccaul on 5/11/18.
 */

module.exports = {
    'getMemoryAttributes': function() {
            const memoryAttributes = {

            "score":0,
            "QACounter":0,

            "history":[],

            "launchCount":0,
            "lastUseTimestamp":0,

            "bookmark":0,
            "factHistory":[],
            "favoriteColor":"",
            "mobileNumber":"",

            // "name":"",
            // "namePronounce":"",
            // "email":"",
            // "mobileNumber":"",
            // "city":"",
            // "state":"",
            // "postcode":"",
            // "birthday":"",
            // "wishlist":[],
        };

        return memoryAttributes;
    },
    'getNumberOfQuestionsToAsk': function() {
      return 5;
    },
    'getWelcomeCardImg': function() {
        return {
            smallImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane720_480.png",
            largeImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane1200_800.png"
        };
    },
    'getTrophyImg': function() {
        return {
            url: 'https://s3-eu-west-1.amazonaws.com/suzyimages/Trophy.png'
        };
    },
    'getDisplayImg1': function() {
        return {
            title: 'Jet Plane',
            url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png'
        };
    },
    'getDisplayImg2': function() {
        return  {
                    title: 'Starry Sky',
                    url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png'

        };
    },
    'getSmallWelcomeImg': function() {
        return {
            title: 'Welcome',
            url: 'https://s3-eu-west-1.amazonaws.com/suzyimages/5.png'
        };
    },
    'getLargeWelcomeImg': function() {
        return {
            title: 'Welcome',
            url: 'https://s3-eu-west-1.amazonaws.com/suzyimages/5.png'
        };
    },
    'getCorrectImg': function() {
        return {
            title: 'Correct',
            url: 'https://s3-eu-west-1.amazonaws.com/suzyimages/Correct.png'
        };
    },
    'getErrorImg': function() {
        return {
            title: 'Wrong',
            url: 'https://s3-eu-west-1.amazonaws.com/suzyimages/Error.png'
        };
    },

    'getObject8': function() {
      return {
        url: 'https://s3-eu-west-1.amazonaws.com/suzyimages/8.png',
        quiz:
          [
            {
              question: 'What color is suzy wearing?',
              answer: 'red'
            },
            {
              question: 'What is the color of suzys shoes?',
              answer: 'yellow'
            }
          ]
      };
    },

    'getObject10': function() {
      return {
        url: 'https://s3-eu-west-1.amazonaws.com/suzyimages/10.png',
        quiz:
          [
            {
              question: 'What color is suzy wearing?',
              answer: 'orange'
            },
            {
              question: 'What is background color of this picture?',
              answer: 'orange'
            },
            {
              question: 'What color is suzys hair?',
              answer: 'brown'
            }
          ]
      };
    },

    'getObjectBoy1': function() {
      return {
        url: 'https://s3-eu-west-1.amazonaws.com/suzyimages/Puzzle_Boy.jpg',
        quiz:
          [
            {
              question: 'What color is little boy wearing?',
              answer: 'green'
            },
            {
              question: 'What is the background color of this picture?',
              answer: 'blue'
            }
          ]
      };
    },

    'getObjectBoy2': function() {
      return {
        url: 'https://s3-eu-west-1.amazonaws.com/suzyimages/11.png',
        quiz:
          [
            {
              question: 'What color is little boy wearing?',
              answer: 'dark green'
            },
            {
              question: 'What is the background color of this picture?',
              answer: 'green'
            }
          ]
      };
    },

    'getObject7': function() {
      return {
        url: 'https://s3-eu-west-1.amazonaws.com/suzyimages/7.png',
        quiz:
          [
            {
              question: 'What color is little girl wearing?',
              answer: 'pink'
            },
            {
              question: 'What is the background color of this picture?',
              answer: 'pink'
            }
          ]
      };
    },

    'getObject9': function() {
      return {
        url: 'https://s3-eu-west-1.amazonaws.com/suzyimages/9.png',
        quiz:
          [
            {
              question: 'What color is little suzy wearing?',
              answer: 'pink'
            },
            {
              question: 'What is the color of the butterfly on the left?',
              answer: 'yellow'
            }
          ]
      };
    },

    'getObject1': function() {
      return {
        url: 'https://s3-eu-west-1.amazonaws.com/suzyimages/1.png',
        quiz:
          [
            {
              question: 'What color is little suzy wearing?',
              answer: 'pink'
            },
            {
              question: 'What is the color of the background?',
              answer: 'blue'
            }
          ]
      };
    },

    'getObject13': function() {
      return {
        url: 'https://s3-eu-west-1.amazonaws.com/suzyimages/13.png',
        quiz:
          [
            {
              question: 'What color is the color of butterfly?',
              answer: 'yellow'
            },
            {
              question: 'What is the color of the background?',
              answer: 'yellow'
            }
          ]
      };
    },

    'getObjects': function() {
        return [this.getObject8(),
                this.getObject10(),
                this.getObjectBoy1(),
                this.getObjectBoy2(),
                this.getObject7(),
                this.getObject9(),
                this.getObject13(),
                this.getObject1()];
    },

    'getSkillTitle': function() {
        return 'Color Guru';
    },

    'getFacts' : function() {
            return [ // include at least 5 facts
                "Chameleon tongues can be as long as 28 inches.",
                "It is estimated that over 100 billion people have lived on the earth so far.",
                "The temperature on Venus is at least 462 degrees Celsius, which is about 864 degrees Fahrenheit.",
                "The world's fastest land animal is Sarah, a cheetah that ran 100 meters in 5.95 seconds.",
                "The quietest natural place on earth is in Washington State's Olympic National Park, within the Hoh Rainforest.",
                "A liger is a hybrid offspring of a male lion and a female tiger.",
                "Boston's Fenway Park has been the home of the Red Sox baseball team since 1912."
            ];

    } ,

    'getMaxHistorySize': function() {  // number of intent/request events to store
        return 3;
    },

    'getDontRepeatLastN': function() {
            return 3;
    },
    'getEmoji': function(emojiName) {

        const emoji = {
            'thumbsup': '\uD83D\uDC4D',
            'smile': '\uD83D\uDE0A',
            'star': '\uD83C\uDF1F',
            'robot': '\uD83E\uDD16',
            'germany': '\ud83c\udde9\ud83c\uddea',
            'uk': '\ud83c\uddec\ud83c\udde7',
            'usa': '\ud83c\uddfa\ud83c\uddf8'
            // Escaped Unicode for other emoji:  https://github.com/wooorm/gemoji/blob/master/support.md

        };

        if (emojiName in emoji) {
            return emoji[emojiName];
        } else {
            return 'NotFound';
        }
    }

};
