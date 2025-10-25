-- Seed tons of interactive party games
INSERT INTO games (name, description, category, min_players, max_players, duration_minutes, thumbnail_url, difficulty) VALUES
-- Trivia Games
('Speed Trivia', 'Fast-paced trivia where speed matters! Answer questions quickly to earn bonus points.', 'trivia', 2, 50, 15, '/placeholder.svg?height=400&width=600', 'easy'),
('Team Trivia Battle', 'Form teams and compete in epic trivia showdowns across multiple categories.', 'trivia', 4, 30, 20, '/placeholder.svg?height=400&width=600', 'medium'),
('Picture Trivia', 'Identify images, logos, and famous faces in this visual trivia challenge.', 'trivia', 2, 40, 15, '/placeholder.svg?height=400&width=600', 'easy'),
('Music Trivia', 'Name that tune! Guess songs, artists, and albums from audio clips.', 'trivia', 2, 50, 20, '/placeholder.svg?height=400&width=600', 'medium'),

-- Drawing Games
('Quick Draw', 'Draw prompts as fast as you can while others guess what you''re drawing!', 'drawing', 3, 20, 15, '/placeholder.svg?height=400&width=600', 'easy'),
('Pictionary Party', 'Classic drawing game where teams compete to guess drawings before time runs out.', 'drawing', 4, 16, 20, '/placeholder.svg?height=400&width=600', 'easy'),
('Doodle Telephone', 'Draw and describe in this hilarious game of visual telephone!', 'drawing', 4, 12, 25, '/placeholder.svg?height=400&width=600', 'medium'),

-- Word Games
('Word Association', 'Connect words in creative ways. Think fast and make unexpected connections!', 'word', 2, 30, 10, '/placeholder.svg?height=400&width=600', 'easy'),
('Rhyme Time', 'Come up with rhyming words under pressure. The clock is ticking!', 'word', 2, 25, 12, '/placeholder.svg?height=400&width=600', 'easy'),
('Word Scramble Race', 'Unscramble words faster than your opponents in this brain-teasing race.', 'word', 2, 40, 15, '/placeholder.svg?height=400&width=600', 'medium'),
('Acronym Challenge', 'Create funny or clever phrases from random acronyms. Vote for the best!', 'word', 3, 30, 15, '/placeholder.svg?height=400&width=600', 'easy'),

-- Voting/Opinion Games
('Hot Takes', 'Share your controversial opinions and see who agrees! Debate and discuss.', 'voting', 3, 50, 15, '/placeholder.svg?height=400&width=600', 'easy'),
('This or That', 'Choose between two options and see how the crowd votes. Surprising results!', 'voting', 2, 100, 10, '/placeholder.svg?height=400&width=600', 'easy'),
('Rank It', 'Rank items in order and compare your rankings with others. Who thinks alike?', 'voting', 2, 50, 15, '/placeholder.svg?height=400&width=600', 'easy'),
('Would You Rather', 'Impossible choices and hilarious scenarios. What would YOU rather do?', 'voting', 2, 60, 12, '/placeholder.svg?height=400&width=600', 'easy'),

-- Party Games
('Two Truths One Lie', 'Share three statements about yourself. Can others spot the lie?', 'party', 3, 20, 20, '/placeholder.svg?height=400&width=600', 'easy'),
('Never Have I Ever', 'Discover surprising facts about your friends in this classic party game.', 'party', 3, 30, 15, '/placeholder.svg?height=400&width=600', 'easy'),
('Story Builder', 'Collaborate to create hilarious stories one sentence at a time.', 'party', 3, 15, 20, '/placeholder.svg?height=400&width=600', 'easy'),
('Emoji Charades', 'Act out emoji combinations while others guess. No words allowed!', 'party', 4, 20, 15, '/placeholder.svg?height=400&width=600', 'easy'),

-- Strategy Games
('Bluff Master', 'Lie convincingly and catch others in their lies. Who''s the best bluffer?', 'strategy', 3, 12, 20, '/placeholder.svg?height=400&width=600', 'hard'),
('Spy Among Us', 'Find the spy before they sabotage the mission. Trust no one!', 'strategy', 5, 15, 25, '/placeholder.svg?height=400&width=600', 'hard'),
('Auction Wars', 'Bid on mystery items and try to build the best collection. Strategy is key!', 'strategy', 3, 20, 20, '/placeholder.svg?height=400&width=600', 'medium'),

-- Reaction Games
('Button Masher', 'Tap your button faster than everyone else when the signal appears!', 'reaction', 2, 50, 5, '/placeholder.svg?height=400&width=600', 'easy'),
('Color Rush', 'Match colors as fast as possible. Speed and accuracy both matter!', 'reaction', 2, 40, 8, '/placeholder.svg?height=400&width=600', 'easy'),
('Simon Says Live', 'Follow the leader''s commands, but only when they say "Simon Says"!', 'reaction', 3, 50, 10, '/placeholder.svg?height=400&width=600', 'easy'),

-- Creative Games
('Meme Master', 'Create the funniest memes using random images and captions. Vote for winners!', 'creative', 3, 25, 15, '/placeholder.svg?height=400&width=600', 'easy'),
('Caption This', 'Write hilarious captions for bizarre images. Funniest caption wins!', 'creative', 3, 30, 12, '/placeholder.svg?height=400&width=600', 'easy'),
('Roast Battle', 'Friendly roasts and comebacks. Keep it fun and creative!', 'creative', 4, 20, 15, '/placeholder.svg?height=400&width=600', 'medium'),

-- Casino Games (already have some, adding more)
('Texas Hold''em Poker', 'Classic poker with up to 8 players. All-in or fold?', 'casino', 2, 8, 30, '/placeholder.svg?height=400&width=600', 'hard'),
('Roulette Royale', 'Place your bets on the wheel. Red or black? Odds or evens?', 'casino', 1, 20, 15, '/placeholder.svg?height=400&width=600', 'easy'),
('Slots Tournament', 'Spin to win in this exciting slots competition. Who''ll hit the jackpot?', 'casino', 1, 50, 10, '/placeholder.svg?height=400&width=600', 'easy'),
('Baccarat Blitz', 'Bet on Player or Banker in this fast-paced card game.', 'casino', 1, 15, 15, '/placeholder.svg?height=400&width=600', 'medium'),

-- Arcade Games
('Marble Racer Pro', 'Enhanced marble racing with power-ups and obstacles!', 'arcade', 2, 20, 10, '/placeholder.svg?height=400&width=600', 'easy'),
('Plinko Paradise', 'Drop chips and watch them bounce to big prizes!', 'arcade', 1, 30, 8, '/placeholder.svg?height=400&width=600', 'easy'),
('Brick Breaker Battle', 'Break bricks faster than your opponents in this classic arcade game.', 'arcade', 1, 20, 12, '/placeholder.svg?height=400&width=600', 'easy'),
('Snake Showdown', 'Grow your snake and avoid others in this multiplayer classic.', 'arcade', 2, 15, 10, '/placeholder.svg?height=400&width=600', 'medium'),

-- Quiz Games
('Pop Culture Quiz', 'Test your knowledge of movies, TV, music, and celebrity gossip!', 'quiz', 2, 50, 15, '/placeholder.svg?height=400&width=600', 'medium'),
('Geography Challenge', 'Identify countries, capitals, and landmarks from around the world.', 'quiz', 2, 40, 20, '/placeholder.svg?height=400&width=600', 'hard'),
('Science Showdown', 'From biology to physics, test your scientific knowledge!', 'quiz', 2, 35, 18, '/placeholder.svg?height=400&width=600', 'hard'),
('History Heroes', 'Journey through time with questions about historical events and figures.', 'quiz', 2, 40, 20, '/placeholder.svg?height=400&width=600', 'medium'),

-- Team Games
('Team Relay', 'Pass challenges between team members. Communication is key!', 'team', 4, 24, 20, '/placeholder.svg?height=400&width=600', 'medium'),
('Escape Room Challenge', 'Solve puzzles together to escape before time runs out!', 'team', 3, 12, 30, '/placeholder.svg?height=400&width=600', 'hard'),
('Scavenger Hunt', 'Find items and complete tasks faster than the other team!', 'team', 4, 20, 25, '/placeholder.svg?height=400&width=600', 'medium')
ON CONFLICT (name) DO NOTHING;
