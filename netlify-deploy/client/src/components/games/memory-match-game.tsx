import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Shuffle, Timer, Trophy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Define card types
interface MemoryCard {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_CONTENTS = [
  '😃', '😃', 
  '😢', '😢', 
  '😡', '😡', 
  '😱', '😱', 
  '🥰', '🥰', 
  '😎', '😎', 
  '🙄', '🙄', 
  '😴', '😴'
];

// Simple stub implementation
export default function MemoryMatchGame({ 
  onComplete 
}: { 
  onComplete: (score: number) => void
}) {
  const { toast } = useToast();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  
  // Initialize/shuffle cards
  const initializeGame = () => {
    const shuffledContents = [...CARD_CONTENTS].sort(() => Math.random() - 0.5);
    
    const newCards = shuffledContents.map((content, index) => ({
      id: index,
      content,
      isFlipped: false,
      isMatched: false
    }));
    
    setCards(newCards);
    setFlippedIndices([]);
    setMatches(0);
    setMoves(0);
    setTimer(0);
    setGameActive(true);
  };
  
  // Handle timer
  useEffect(() => {
    let interval: number | null = null;
    
    if (gameActive) {
      interval = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameActive]);
  
  // Check for game completion
  useEffect(() => {
    if (matches === CARD_CONTENTS.length / 2 && gameActive) {
      setGameActive(false);
      
      // Calculate score based on moves and time
      const maxScore = 1000;
      const movePenalty = moves * 10;
      const timePenalty = timer * 2;
      const score = Math.max(maxScore - movePenalty - timePenalty, 300);
      
      // Notify success
      toast({
        title: "Memory Match Complete!",
        description: `You completed the game in ${moves} moves and ${timer} seconds.`,
      });
      
      // Trigger completion callback
      setTimeout(() => {
        onComplete(score);
      }, 1500);
    }
  }, [matches, gameActive, moves, timer, toast, onComplete]);
  
  // Check for matches
  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [first, second] = flippedIndices;
      
      if (cards[first].content === cards[second].content) {
        // Match found
        setCards(prevCards => 
          prevCards.map((card, index) => 
            index === first || index === second
              ? { ...card, isMatched: true }
              : card
          )
        );
        
        setMatches(prev => prev + 1);
        setFlippedIndices([]);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map((card, index) => 
              index === first || index === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          
          setFlippedIndices([]);
        }, 1000);
      }
      
      // Increment move counter
      setMoves(prev => prev + 1);
    }
  }, [flippedIndices, cards]);
  
  // Handle card click
  const handleCardClick = (index: number) => {
    // Ignore click if:
    if (
      !gameActive || // Game not active
      flippedIndices.length >= 2 || // Already two cards flipped
      flippedIndices.includes(index) || // Card already flipped
      cards[index].isMatched // Card already matched
    ) {
      return;
    }
    
    // Flip the card
    setCards(prevCards => 
      prevCards.map((card, i) => 
        i === index ? { ...card, isFlipped: true } : card
      )
    );
    
    // Add to flipped indices
    setFlippedIndices(prev => [...prev, index]);
  };
  
  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Brain className="mr-2 h-5 w-5" />
              Memory Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Timer className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Time: {timer}s</span>
              </div>
              <div className="flex items-center">
                <Shuffle className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Moves: {moves}</span>
              </div>
              <div className="col-span-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress:</span>
                  <span>{matches} / {CARD_CONTENTS.length / 2}</span>
                </div>
                <Progress value={(matches / (CARD_CONTENTS.length / 2)) * 100} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {!gameActive && matches === 0 ? (
              <Button onClick={initializeGame} className="w-full">Start Game</Button>
            ) : !gameActive ? (
              <Button onClick={initializeGame} className="w-full">Play Again</Button>
            ) : (
              <Button variant="outline" onClick={() => setGameActive(false)} className="w-full">Reset Game</Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {cards.length > 0 && (
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {cards.map((card, index) => (
            <div 
              key={card.id}
              className={`aspect-square flex items-center justify-center text-3xl sm:text-4xl cursor-pointer transition-all duration-300 transform ${
                card.isFlipped || card.isMatched ? 'bg-primary/10 rotate-y-0' : 'bg-primary/5 rotate-y-180'
              } ${card.isMatched ? 'opacity-70' : 'opacity-100'} rounded-lg`}
              onClick={() => handleCardClick(index)}
            >
              {(card.isFlipped || card.isMatched) && card.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}