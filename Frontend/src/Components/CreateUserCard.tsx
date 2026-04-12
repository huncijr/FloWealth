import { Button, Card } from "@heroui/react";
import { Sparkles, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateUserCard = () => {
  const navigate = useNavigate();
  return (
    <div className="relative flex items-center justify-center min-h-[60vh] p-8 create-user-easein">
      {/* Card */}

      <Card className="relative z-10 max-w-md w-full bg-content1/80 backdrop-blur-sm border-1 border-divider shadow-xl">
        <Card.Header className="flex flex-col items-center gap-6 p-8">
          {/* Icon with Glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
            <div className="relative p-6 bg-primary/10 rounded-full">
              <UserPlus className="w-16 h-16 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center">Make an Account</h2>

          {/* Description */}
          <p className="text-center text-default-500 max-w-sm">
            Sign up to track your expenses with AI-powered receipt scanning!
          </p>

          {/* Feature Chips */}
          <div className="badge-gold text-sm">
            <span className="badge-sheen" />
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Free</span>
            <span>·</span>
            <span>AI-powered</span>
            <span>·</span>
            <span>Easy</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button className="btn-gold" onClick={() => navigate("/Account")}>
              Create Account
            </Button>
            <Button
              className="btn-gold btn-gold-outline"
              onClick={() => navigate("/Home")}
            >
              Learn More
            </Button>
          </div>
        </Card.Header>
      </Card>
    </div>
  );
};

export default CreateUserCard;
