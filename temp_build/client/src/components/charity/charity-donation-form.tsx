import { useState } from "react";
import { Coins, Heart, User, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface Charity {
  id: number;
  name: string;
  description: string;
  category: string;
  logoUrl?: string;
  website: string;
  impact: string;
}

interface CharityDonationFormProps {
  tokenBalance: number;
  onDonate: (charityId: number, amount: number) => void;
}

const featuredCharities: Charity[] = [
  {
    id: 1,
    name: "Mental Health Alliance",
    description: "Supporting mental health initiatives and providing resources for those in need.",
    category: "Health",
    logoUrl: "",
    website: "https://example.org/mha",
    impact: "Helped over 10,000 people access mental health resources last year.",
  },
  {
    id: 2,
    name: "Emotional Wellness Foundation",
    description: "Promoting emotional intelligence and wellness through education and outreach.",
    category: "Education",
    logoUrl: "",
    website: "https://example.org/ewf",
    impact: "Funded educational programs in over 500 schools worldwide.",
  },
  {
    id: 3,
    name: "Global Mood Support",
    description: "Providing crisis intervention and support for those dealing with mood disorders.",
    category: "Crisis Support",
    logoUrl: "",
    website: "https://example.org/gms",
    impact: "Operates 24/7 support lines in 15 countries and multiple languages.",
  },
];

export default function CharityDonationForm({ tokenBalance, onDonate }: CharityDonationFormProps) {
  const [selectedCharity, setSelectedCharity] = useState<number | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSliderChange = (value: number[]) => {
    setDonationAmount(value[0]);
    setIsCustomAmount(false);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    setIsCustomAmount(true);
    
    if (value && !isNaN(Number(value))) {
      setDonationAmount(Math.min(Number(value), tokenBalance));
    }
  };

  const handleSubmit = () => {
    if (selectedCharity === null) {
      toast({
        title: "No charity selected",
        description: "Please select a charity to donate to.",
        variant: "destructive",
      });
      return;
    }

    const amount = isCustomAmount ? Number(customAmount) : donationAmount;
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    if (amount > tokenBalance) {
      toast({
        title: "Insufficient tokens",
        description: "You don't have enough tokens for this donation.",
        variant: "destructive",
      });
      return;
    }

    onDonate(selectedCharity, amount);
    
    toast({
      title: "Donation successful!",
      description: `You've donated ${amount} tokens to ${featuredCharities.find(c => c.id === selectedCharity)?.name}. Thank you for your generosity!`,
    });
    
    // Reset form
    setSelectedCharity(null);
    setDonationAmount(10);
    setCustomAmount("");
    setIsCustomAmount(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="text-primary h-5 w-5" />
          Donate to Charity
        </CardTitle>
        <CardDescription>
          Use your tokens to support charities promoting mental health and emotional wellness.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="mb-4 font-medium">Your token balance</div>
          <div className="flex items-center gap-2 text-lg">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="font-bold">{tokenBalance}</span>
            <span className="text-muted-foreground">available tokens</span>
          </div>
        </div>

        <div>
          <div className="mb-4 font-medium">Select a charity</div>
          <RadioGroup value={selectedCharity?.toString()} onValueChange={(value) => setSelectedCharity(Number(value))}>
            <div className="grid gap-4">
              {featuredCharities.map((charity) => (
                <Label
                  key={charity.id}
                  htmlFor={`charity-${charity.id}`}
                  className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCharity === charity.id ? "border-primary bg-primary/5" : "hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem
                    value={charity.id.toString()}
                    id={`charity-${charity.id}`}
                    className="mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {charity.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{charity.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">{charity.description}</div>
                    <div className="text-xs bg-secondary/50 inline-block px-2 py-0.5 rounded-full">
                      {charity.category}
                    </div>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div>
          <div className="mb-4 font-medium">Donation amount</div>
          <div className="space-y-4">
            <Slider 
              value={[donationAmount]} 
              onValueChange={handleSliderChange}
              max={Math.max(100, tokenBalance)}
              step={1}
              className={isCustomAmount ? "opacity-50" : ""}
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>1 token</span>
              <span>{Math.max(100, tokenBalance)} tokens</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Button
                  type="button"
                  variant={!isCustomAmount ? "default" : "outline"}
                  className="w-full"
                  onClick={() => {
                    setIsCustomAmount(false);
                  }}
                >
                  {donationAmount} tokens
                </Button>
              </div>
              <div className="text-center">or</div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="w-full"
                  max={tokenBalance}
                  min={1}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={!selectedCharity || donationAmount <= 0 || donationAmount > tokenBalance}
          className="w-full"
        >
          Donate {isCustomAmount && customAmount ? customAmount : donationAmount} Tokens
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}