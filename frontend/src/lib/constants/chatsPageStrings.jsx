export const conversations = [
    {
      id: 1,
      name: "Alice Johnson",
      lastMessage: "Hey, did you finish the project report?",
      time: "5m",
      avatar: "/api/placeholder/40/40?text=A"
    },
    {
      id: 2,
      name: "Bob Smith",
      lastMessage: "I'll be late to the meeting today.",
      time: "12m",
      avatar: "/api/placeholder/40/40?text=B"
    },
    {
      id: 3,
      name: "Charlie Brown",
      lastMessage: "Can we reschedule the lab session to next week?",
      time: "20m",
      avatar: "/api/placeholder/40/40?text=C"
    },
    {
      id: 4,
      name: "Diana Prince",
      lastMessage: "Thanks for sending the slides! They were super helpful.",
      time: "30m",
      avatar: "/api/placeholder/40/40?text=D"
    },
    {
      id: 5,
      name: "Ethan Hunt",
      lastMessage: "Reminder: submission deadline is tomorrow.",
      time: "45m",
      avatar: "/api/placeholder/40/40?text=E"
    },
    {
      id: 6,
      name: "Fiona Gallagher",
      lastMessage: "LOL, that meme was hilarious 😂",
      time: "1h",
      avatar: "/api/placeholder/40/40?text=F"
    },
    {
      id: 7,
      name: "George Martin",
      lastMessage: "Let's meet at the library around 3pm.",
      time: "2h",
      avatar: "/api/placeholder/40/40?text=G"
    },
    {
      id: 8,
      name: "Hannah Lee",
      lastMessage: "Can you review my code for the assignment?",
      time: "3h",
      avatar: "/api/placeholder/40/40?text=H"
    },
    {
      id: 9,
      name: "Ian Somerhalder",
      lastMessage: "The test was tougher than I expected!",
      time: "4h",
      avatar: "/api/placeholder/40/40?text=I"
    },
    {
      id: 10,
      name: "Jasmine Wu",
      lastMessage: "Great job on the presentation today, everyone!",
      time: "5h",
      avatar: "/api/placeholder/40/40?text=J"
    },
    {
      id: 11,
      name: "Kevin Durant",
      lastMessage: "Anyone up for a quick study session later?",
      time: "6h",
      avatar: "/api/placeholder/40/40?text=K"
    },
    {
      id: 12,
      name: "Laura Palmer",
      lastMessage: "I finally got the results back; we need to discuss.",
      time: "7h",
      avatar: "/api/placeholder/40/40?text=L"
    }
  ];
  


  export const dummyChats = {
    1: [ // Alice Johnson
      { id: 1, sender: 'other', content: 'Hey, did you finish the project report?', timestamp: '2 hours ago' },
      { id: 2, sender: 'me', content: 'Almost done! Just need to add the conclusion section.', timestamp: '2 hours ago' },
      { id: 3, sender: 'other', content: 'Great! I can help you review it before submission.', timestamp: '1 hour ago' },
      { id: 4, sender: 'me', content: 'That would be amazing, thank you!', timestamp: '1 hour ago' },
      { id: 5, sender: 'other', content: 'No problem! Send it over when you\'re ready.', timestamp: '55m ago' },
      { id: 6, sender: 'me', content: 'Careful, once you open it, your eyes might never recover.', timestamp: '54m ago' },
      { id: 7, sender: 'other', content: 'Don’t worry, I’ve survived looking at my own selfies.', timestamp: '54m ago' },
      { id: 8, sender: 'me', content: 'Ouch. That roast was unprovoked 😂', timestamp: '53m ago' },
      { id: 9, sender: 'other', content: 'All’s fair in love, war, and group projects.', timestamp: '52m ago' },
      { id: 10, sender: 'me', content: 'Then I declare war on your typos.', timestamp: '50m ago' },
      { id: 11, sender: 'other', content: 'Plot twist: I make typos on purpose, so you edit for me.', timestamp: '49m ago' },
      { id: 12, sender: 'me', content: 'That’s evil genius level right there.', timestamp: '48m ago' },
      { id: 13, sender: 'other', content: 'Thank you, I try. My villain origin story is proofreading.', timestamp: '47m ago' },
      { id: 14, sender: 'me', content: 'Mine is forgetting to attach the file in emails.', timestamp: '45m ago' },
      { id: 15, sender: 'other', content: 'Classic. The “see attached” but nothing is attached move.', timestamp: '44m ago' },
      { id: 16, sender: 'me', content: 'I swear Gmail does it on purpose.', timestamp: '44m ago' },
      { id: 17, sender: 'other', content: 'Nope, it’s your inner chaos gremlin.', timestamp: '43m ago' },
      { id: 18, sender: 'me', content: 'Gremlin needs coffee before functioning.', timestamp: '42m ago' },
      { id: 19, sender: 'other', content: 'Don’t we all? Coffee: liquid personality upgrade.', timestamp: '41m ago' },
      { id: 20, sender: 'me', content: 'Upgrade not guaranteed. Side effects: jitter dance.', timestamp: '40m ago' },
      { id: 21, sender: 'other', content: 'Better than the “sleep in class” DLC you keep installing.', timestamp: '39m ago' },
      { id: 22, sender: 'me', content: 'Hey, those naps are tactical power naps.', timestamp: '38m ago' },
      { id: 23, sender: 'other', content: 'More like tactical snoring.', timestamp: '37m ago' },
      { id: 24, sender: 'me', content: 'It’s called surround sound ambiance.', timestamp: '37m ago' },
      { id: 25, sender: 'other', content: 'Tell that to the professor who looked like he aged 10 years listening.', timestamp: '36m ago' },
      { id: 26, sender: 'me', content: 'At least he didn’t throw chalk at me.', timestamp: '35m ago' },
      { id: 27, sender: 'other', content: 'True, though you’d probably dodge like Neo.', timestamp: '34m ago' },
      { id: 28, sender: 'me', content: 'Matrix speed but only for snacks, not assignments.', timestamp: '33m ago' },
      { id: 29, sender: 'other', content: 'Priorities. Chips > GPA.', timestamp: '33m ago' },
      { id: 30, sender: 'me', content: 'Don’t expose my life philosophy like that.', timestamp: '32m ago' },
      { id: 31, sender: 'other', content: 'Fine, I’ll keep it a secret… for a snack bribe.', timestamp: '31m ago' },
      { id: 32, sender: 'me', content: 'Blackmail with Doritos? Cold.', timestamp: '30m ago' },
      { id: 33, sender: 'other', content: 'Crunchy justice is the best justice.', timestamp: '29m ago' },
      { id: 34, sender: 'me', content: 'If I share, you better not leave orange fingerprints on my report.', timestamp: '29m ago' },
      { id: 35, sender: 'other', content: 'No promises. I sign documents with cheese dust.', timestamp: '28m ago' },
      { id: 36, sender: 'me', content: 'That explains your “cheesy” reputation.', timestamp: '28m ago' },
      { id: 37, sender: 'other', content: '😂 I walked into that one.', timestamp: '27m ago' },
      { id: 38, sender: 'me', content: 'And tripped over your own joke.', timestamp: '26m ago' },
      { id: 39, sender: 'other', content: 'At least I made the landing stylish.', timestamp: '25m ago' },
      { id: 40, sender: 'me', content: 'Yeah, with jazz hands.', timestamp: '24m ago' },
      { id: 41, sender: 'other', content: 'Don’t disrespect jazz hands, they save lives.', timestamp: '23m ago' },
      { id: 42, sender: 'me', content: 'Name one life saved by jazz hands.', timestamp: '22m ago' },
      { id: 43, sender: 'other', content: 'Mine, when I danced away from embarrassment.', timestamp: '21m ago' },
      { id: 44, sender: 'me', content: 'Bold strategy, let’s see if it pays off.', timestamp: '20m ago' },
      { id: 45, sender: 'other', content: 'It always pays off in memes.', timestamp: '19m ago' },
      { id: 46, sender: 'me', content: 'Speaking of memes, I’m adding one as my report cover.', timestamp: '18m ago' },
      { id: 47, sender: 'other', content: 'If it’s not Shrek, I’m disappointed.', timestamp: '17m ago' },
      { id: 48, sender: 'me', content: 'Shrek IS love. Shrek IS life.', timestamp: '16m ago' },
      { id: 49, sender: 'other', content: 'Okay, we’re best friends now.', timestamp: '15m ago' },
      { id: 50, sender: 'me', content: 'Seal it with Doritos and a handshake.', timestamp: 'Just now' }
    ],
    
    2: [ // Bob Smith
      { id: 1, sender: 'other', content: 'I\'ll be late to the meeting today.', timestamp: '30 minutes ago' },
      { id: 2, sender: 'me', content: 'No worries, what time can you make it?', timestamp: '25 minutes ago' },
      { id: 3, sender: 'other', content: 'Probably around 2:30 PM. Traffic is crazy today.', timestamp: '20 minutes ago' },
      { id: 4, sender: 'me', content: 'Alright, we\'ll start without you and catch you up.', timestamp: '15 minutes ago' },
      { id: 5, sender: 'other', content: 'Thanks for understanding!', timestamp: '12m ago' }
    ],
    3: [ // Charlie Brown
      { id: 1, sender: 'other', content: 'Can we reschedule the lab session to next week?', timestamp: '1 day ago' },
      { id: 2, sender: 'me', content: 'Sure, what day works best for you?', timestamp: '1 day ago' },
      { id: 3, sender: 'other', content: 'How about Wednesday at 3 PM?', timestamp: '1 day ago' },
      { id: 4, sender: 'me', content: 'Wednesday works perfectly. I\'ll update the calendar.', timestamp: '1 day ago' },
      { id: 5, sender: 'other', content: 'Awesome, see you then!', timestamp: '20m ago' }
    ],
    4: [ // Diana Prince
      { id: 1, sender: 'other', content: 'Thanks for sending the slides! They were super helpful.', timestamp: '3 hours ago' },
      { id: 2, sender: 'me', content: 'Glad they helped! Did you have any questions about the content?', timestamp: '2 hours ago' },
      { id: 3, sender: 'other', content: 'Just one question about slide 15 - the formula calculation.', timestamp: '2 hours ago' },
      { id: 4, sender: 'me', content: 'Ah yes, that\'s the tricky part. Want to hop on a quick call?', timestamp: '1 hour ago' },
      { id: 5, sender: 'other', content: 'That would be great! I\'m free now.', timestamp: '30m ago' }
    ],
    5: [ // Ethan Hunt
      { id: 1, sender: 'other', content: 'Reminder: submission deadline is tomorrow.', timestamp: '4 hours ago' },
      { id: 2, sender: 'me', content: 'Thanks for the reminder! I\'m about 80% done.', timestamp: '3 hours ago' },
      { id: 3, sender: 'other', content: 'Good progress! Need any help with the final parts?', timestamp: '3 hours ago' },
      { id: 4, sender: 'me', content: 'Actually, yes. Could you review my methodology section?', timestamp: '2 hours ago' },
      { id: 5, sender: 'other', content: 'Of course! Send it over and I\'ll take a look.', timestamp: '45m ago' }
    ],
    6: [ // Fiona Gallagher
      { id: 1, sender: 'other', content: 'LOL, that meme was hilarious 😂', timestamp: '2 hours ago' },
      { id: 2, sender: 'me', content: 'Haha right? I couldn\'t stop laughing!', timestamp: '2 hours ago' },
      { id: 3, sender: 'other', content: 'We should start a meme group chat with everyone', timestamp: '1 hour ago' },
      { id: 4, sender: 'me', content: 'Yes! That\'s such a good idea 🤣', timestamp: '1 hour ago' },
      { id: 5, sender: 'other', content: 'I\'ll create it now and add everyone!', timestamp: '1h ago' }
    ],
    7: [ // George Martin
      { id: 1, sender: 'other', content: 'Let\'s meet at the library around 3pm.', timestamp: '5 hours ago' },
      { id: 2, sender: 'me', content: 'Sounds good! Which floor should we meet on?', timestamp: '4 hours ago' },
      { id: 3, sender: 'other', content: 'Let\'s go to the 3rd floor study area.', timestamp: '4 hours ago' },
      { id: 4, sender: 'me', content: 'Perfect, I\'ll bring my laptop and notes.', timestamp: '3 hours ago' },
      { id: 5, sender: 'other', content: 'Great! See you there.', timestamp: '2h ago' }
    ],
    8: [ // Hannah Lee
      { id: 1, sender: 'other', content: 'Can you review my code for the assignment?', timestamp: '6 hours ago' },
      { id: 2, sender: 'me', content: 'Sure! Send me the GitHub link.', timestamp: '5 hours ago' },
      { id: 3, sender: 'other', content: 'Here it is: github.com/hannah/assignment-3', timestamp: '5 hours ago' },
      { id: 4, sender: 'me', content: 'Looking at it now. Your logic looks solid!', timestamp: '4 hours ago' },
      { id: 5, sender: 'other', content: 'Thank you! Any suggestions for improvement?', timestamp: '3h ago' }
    ],
    9: [ // Ian Somerhalder
      { id: 1, sender: 'other', content: 'The test was tougher than I expected!', timestamp: '8 hours ago' },
      { id: 2, sender: 'me', content: 'I know right! Question 7 was brutal.', timestamp: '7 hours ago' },
      { id: 3, sender: 'other', content: 'Exactly! I had no idea how to approach that one.', timestamp: '7 hours ago' },
      { id: 4, sender: 'me', content: 'Let\'s compare answers when we get the results back.', timestamp: '6 hours ago' },
      { id: 5, sender: 'other', content: 'Good idea! Hopefully we both did better than we think.', timestamp: '4h ago' }
    ],
    10: [ // Jasmine Wu
      { id: 1, sender: 'other', content: 'Great job on the presentation today, everyone!', timestamp: '10 hours ago' },
      { id: 2, sender: 'me', content: 'Thanks! Your part about market analysis was excellent.', timestamp: '9 hours ago' },
      { id: 3, sender: 'other', content: 'Appreciate it! The whole team did amazing.', timestamp: '9 hours ago' },
      { id: 4, sender: 'me', content: 'Should we celebrate? Maybe dinner tomorrow?', timestamp: '8 hours ago' },
      { id: 5, sender: 'other', content: 'I\'m in! Let\'s plan something fun.', timestamp: '5h ago' }
    ],
    11: [ // Kevin Durant
      { id: 1, sender: 'other', content: 'Anyone up for a quick study session later?', timestamp: '12 hours ago' },
      { id: 2, sender: 'me', content: 'I\'m interested! What subject?', timestamp: '11 hours ago' },
      { id: 3, sender: 'other', content: 'Statistics - I\'m struggling with hypothesis testing.', timestamp: '11 hours ago' },
      { id: 4, sender: 'me', content: 'Perfect! That\'s my strong suit. Happy to help.', timestamp: '10 hours ago' },
      { id: 5, sender: 'other', content: 'You\'re a lifesaver! When and where?', timestamp: '6h ago' }
    ],
    12: [ // Laura Palmer
      { id: 1, sender: 'other', content: 'I finally got the results back; we need to discuss.', timestamp: '15 hours ago' },
      { id: 2, sender: 'me', content: 'How did it go? Good news or bad news?', timestamp: '14 hours ago' },
      { id: 3, sender: 'other', content: 'Mixed results. Some parts were great, others need work.', timestamp: '14 hours ago' },
      { id: 4, sender: 'me', content: 'That\'s normal for a first attempt. What needs improvement?', timestamp: '13 hours ago' },
      { id: 5, sender: 'other', content: 'Mainly the data analysis section. Can we work on it together?', timestamp: '7h ago' }
    ]
  };

  // Files for each chat
  export const chatFiles = {
    1: [ // Alice Johnson - Project files
      { id: 'a1', name: 'Project_Report_Draft.docx', date: '1 September 2025', type: 'doc', size: '2.1 MB' },
      { id: 'a2', name: 'Research_Data.xlsx', date: '31 August 2025', type: 'file', size: '856 KB' },
      { id: 'a3', name: 'References.pdf', date: '30 August 2025', type: 'pdf', size: '1.2 MB' }
    ],
    2: [ // Bob Smith - Meeting files
      { id: 'b1', name: 'Meeting_Agenda.pdf', date: '1 September 2025', type: 'pdf', size: '245 KB' },
      { id: 'b2', name: 'Traffic_Update.jpg', date: '1 September 2025', type: 'image', size: '1.1 MB' }
    ],
    3: [ // Charlie Brown - Lab files
      { id: 'c1', name: 'Lab_Schedule.pdf', date: '29 August 2025', type: 'pdf', size: '567 KB' },
      { id: 'c2', name: 'Lab_Equipment_List.docx', date: '28 August 2025', type: 'doc', size: '234 KB' },
      { id: 'c3', name: 'Safety_Guidelines.pdf', date: '25 August 2025', type: 'pdf', size: '1.8 MB' }
    ],
    4: [ // Diana Prince - Presentation files
      { id: 'd1', name: 'Lecture_Slides_Ch15.pptx', date: '31 August 2025', type: 'file', size: '4.2 MB' },
      { id: 'd2', name: 'Formula_Examples.pdf', date: '30 August 2025', type: 'pdf', size: '678 KB' },
      { id: 'd3', name: 'Practice_Problems.docx', date: '29 August 2025', type: 'doc', size: '445 KB' }
    ],
    5: [ // Ethan Hunt - Assignment files
      { id: 'e1', name: 'Assignment_Guidelines.pdf', date: '25 August 2025', type: 'pdf', size: '1.1 MB' },
      { id: 'e2', name: 'Methodology_Draft.docx', date: '1 September 2025', type: 'doc', size: '1.7 MB' },
      { id: 'e3', name: 'Data_Analysis.xlsx', date: '31 August 2025', type: 'file', size: '2.3 MB' }
    ],
    6: [ // Fiona Gallagher - Fun files
      { id: 'f1', name: 'Funny_Memes.jpg', date: '1 September 2025', type: 'image', size: '2.1 MB' },
      { id: 'f2', name: 'Group_Photo.jpg', date: '28 August 2025', type: 'image', size: '3.4 MB' }
    ],
    7: [ // George Martin - Study files
      { id: 'g1', name: 'Study_Notes_Ch1-5.pdf', date: '30 August 2025', type: 'pdf', size: '3.1 MB' },
      { id: 'g2', name: 'Library_Map.jpg', date: '1 September 2025', type: 'image', size: '892 KB' },
      { id: 'g3', name: 'Study_Schedule.docx', date: '29 August 2025', type: 'doc', size: '123 KB' }
    ],
    8: [ // Hannah Lee - Code files
      { id: 'h1', name: 'assignment3_code.py', date: '1 September 2025', type: 'file', size: '45 KB' },
      { id: 'h2', name: 'test_cases.py', date: '31 August 2025', type: 'file', size: '23 KB' },
      { id: 'h3', name: 'README.md', date: '30 August 2025', type: 'file', size: '12 KB' }
    ],
    9: [ // Ian Somerhalder - Test files
      { id: 'i1', name: 'Test_Review_Sheet.pdf', date: '29 August 2025', type: 'pdf', size: '1.5 MB' },
      { id: 'i2', name: 'Practice_Test.pdf', date: '27 August 2025', type: 'pdf', size: '987 KB' },
      { id: 'i3', name: 'Answer_Key.pdf', date: '26 August 2025', type: 'pdf', size: '234 KB' }
    ],
    10: [ // Jasmine Wu - Presentation files
      { id: 'j1', name: 'Team_Presentation.pptx', date: '31 August 2025', type: 'file', size: '8.7 MB' },
      { id: 'j2', name: 'Market_Analysis.xlsx', date: '30 August 2025', type: 'file', size: '1.9 MB' },
      { id: 'j3', name: 'Celebration_Ideas.docx', date: '1 September 2025', type: 'doc', size: '567 KB' }
    ],
    11: [ // Kevin Durant - Study files
      { id: 'k1', name: 'Statistics_Notes.pdf', date: '28 August 2025', type: 'pdf', size: '2.8 MB' },
      { id: 'k2', name: 'Hypothesis_Testing_Guide.pdf', date: '27 August 2025', type: 'pdf', size: '1.4 MB' },
      { id: 'k3', name: 'Practice_Problems.docx', date: '26 August 2025', type: 'doc', size: '678 KB' }
    ],
    12: [ // Laura Palmer - Results files
      { id: 'l1', name: 'Research_Results.pdf', date: '31 August 2025', type: 'pdf', size: '3.2 MB' },
      { id: 'l2', name: 'Data_Analysis_Report.docx', date: '30 August 2025', type: 'doc', size: '2.1 MB' },
      { id: 'l3', name: 'Improvement_Plan.docx', date: '1 September 2025', type: 'doc', size: '445 KB' }
    ]
  };
