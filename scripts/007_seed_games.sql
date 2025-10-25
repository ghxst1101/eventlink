-- Insert built-in games
insert into public.games (name, slug, description, thumbnail_url, category) values
  ('Marble Racer', 'marble-racer', 'Race your marble through challenging tracks and compete for the best time!', '/placeholder.svg?height=200&width=300', 'racing'),
  ('Plinko', 'plinko', 'Drop the ball and watch it bounce through pegs to win big!', '/placeholder.svg?height=200&width=300', 'arcade'),
  ('Blackjack', 'blackjack', 'Classic casino card game. Get as close to 21 as possible without going over!', '/placeholder.svg?height=200&width=300', 'casino'),
  ('Poker', 'poker', 'Texas Hold''em Poker. Make the best hand and win the pot!', '/placeholder.svg?height=200&width=300', 'casino'),
  ('Roulette', 'roulette', 'Spin the wheel and bet on your lucky number!', '/placeholder.svg?height=200&width=300', 'casino'),
  ('Slots', 'slots', 'Pull the lever and match the symbols to win jackpots!', '/placeholder.svg?height=200&width=300', 'casino'),
  ('Dice Duel', 'dice-duel', 'Roll the dice and compete against other players!', '/placeholder.svg?height=200&width=300', 'arcade'),
  ('Color Match', 'color-match', 'Match colors quickly before time runs out!', '/placeholder.svg?height=200&width=300', 'puzzle'),
  ('Snake', 'snake', 'Classic snake game. Eat food and grow longer without hitting yourself!', '/placeholder.svg?height=200&width=300', 'arcade'),
  ('Tetris', 'tetris', 'Arrange falling blocks to clear lines and score points!', '/placeholder.svg?height=200&width=300', 'puzzle')
on conflict (slug) do nothing;
