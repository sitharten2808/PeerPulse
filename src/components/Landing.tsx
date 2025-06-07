
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Heart, BarChart, Star, ArrowDown } from 'lucide-react';

const Landing: React.FC = () => {
  const features = [
    {
      icon: Heart,
      title: 'Anonymous Feedback',
      description: 'Give and receive honest feedback in a safe, anonymous environment that builds trust.'
    },
    {
      icon: BarChart,
      title: 'Visual Insights',
      description: 'Beautiful charts and summaries help teams understand their dynamics at a glance.'
    },
    {
      icon: Users,
      title: 'Team Health Checks',
      description: 'Regular pulse surveys keep your finger on the team\'s emotional wellbeing.'
    },
    {
      icon: Star,
      title: 'AI-Powered Summaries',
      description: 'Smart algorithms identify patterns and provide actionable insights automatically.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/50 to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="gradient-text">Peer</span>
              <span className="text-foreground">Pulse</span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Transform your team dynamics with anonymous feedback, visual insights, and AI-powered team health analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="gradient-bg hover:scale-105 transition-transform pulse-shadow">
                  Get Started Free
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="hover:scale-105 transition-transform">
                Watch Demo
              </Button>
            </div>
          </div>
          
          <div className="mt-16 flex justify-center">
            <ArrowDown className="h-6 w-6 text-muted-foreground animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need for <span className="gradient-text">healthy teams</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for student teams and project groups who want to grow together through honest, constructive feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="card-hover border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">10k+</div>
              <div className="text-lg text-muted-foreground">Feedback Sessions</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">500+</div>
              <div className="text-lg text-muted-foreground">Active Teams</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">98%</div>
              <div className="text-lg text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to build stronger teams?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of teams already using PeerPulse to create more connected, productive working relationships.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
