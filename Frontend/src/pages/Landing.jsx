import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Wrench,
  Calendar,
  Users,
  BarChart3,
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';
import Button from '../components/common/Button';

const Landing = () => {
  const features = [
    {
      icon: <Wrench size={24} />,
      title: 'Equipment Tracking',
      description: 'Track all your assets in one place with detailed records and maintenance history.',
    },
    {
      icon: <Users size={24} />,
      title: 'Team Management',
      description: 'Organize specialized teams and assign maintenance tasks efficiently.',
    },
    {
      icon: <Calendar size={24} />,
      title: 'Smart Scheduling',
      description: 'Schedule preventive maintenance and never miss critical service dates.',
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Insights & Reports',
      description: 'Get actionable insights with comprehensive maintenance analytics.',
    },
    {
      icon: <Shield size={24} />,
      title: 'Warranty Management',
      description: 'Track warranty information and ensure timely claims.',
    },
    {
      icon: <Zap size={24} />,
      title: 'Real-time Updates',
      description: 'Stay informed with instant notifications and status updates.',
    },
  ];

  const benefits = [
    'Reduce equipment downtime by up to 40%',
    'Streamline maintenance workflows',
    'Extend asset lifespan',
    'Improve team productivity',
    'Comprehensive audit trails',
  ];

  const stats = [
    { value: '40%', label: 'Reduction in Downtime', icon: <TrendingUp size={24} /> },
    { value: '500+', label: 'Companies Trust Us', icon: <Users size={24} /> },
    { value: '99.9%', label: 'System Uptime', icon: <Clock size={24} /> },
    { value: '4.9/5', label: 'Customer Rating', icon: <Award size={24} /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-secondary-200 bg-white/80 backdrop-blur-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg p-0">
                <img
                  src="/logo.jpg"
                  alt="GearGuard logo"
                  className="w-6 h-6 object-contain"
                />
              </div>

              <div>
                <h1 className="text-xl font-display font-bold text-secondary-900">
                  GearGuard
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary-100 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary-200 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6 shadow-sm">
              <Zap size={16} />
              <span>Trusted by 500+ companies worldwide</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-secondary-900 mb-6 leading-tight">
              Enterprise-Grade
              <span className="block mt-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Maintenance Management
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-secondary-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Transform your maintenance operations with intelligent automation, real-time insights, and seamless team collaboration.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/signup">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto shadow-lg hover:shadow-xl"
                  icon={<ArrowRight size={20} />}
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-secondary-100">
                  <div className="flex justify-center mb-3 text-primary-600">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-secondary-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-secondary-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-50 to-white"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-semibold mb-4">
              POWERFUL FEATURES
            </div>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-secondary-900 mb-4">
              Everything you need to manage maintenance
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Powerful features designed to make equipment maintenance simple and efficient.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-white border border-secondary-200 hover:border-primary-300 hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-secondary-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-200 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-300 rounded-full filter blur-3xl opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-success-100 rounded-full text-success-700 text-sm font-semibold mb-4">
                PROVEN RESULTS
              </div>
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-secondary-900 mb-6 leading-tight">
                Reduce costs and increase efficiency
              </h2>
              <p className="text-lg text-secondary-600 mb-8 leading-relaxed">
                GearGuard helps organizations optimize their maintenance operations and maximize equipment uptime with data-driven insights and automation.
              </p>

              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 bg-white rounded-lg p-4 shadow-sm border border-secondary-100">
                    <div className="flex-shrink-0 w-6 h-6 bg-success-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="text-success-600" size={16} />
                    </div>
                    <span className="text-secondary-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link to="/signup">
                <Button size="lg" variant="primary" className="shadow-lg">
                  Get Started Now
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary-500 to-primary-800 rounded-3xl p-1 shadow-2xl">
                <div className="bg-white rounded-3xl p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <TrendingUp size={32} className="text-white" />
                      </div>
                      <p className="text-3xl font-bold text-secondary-900 mb-1">40%</p>
                      <p className="text-sm text-secondary-600">Less Downtime</p>
                    </div>
                    <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-2xl p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Clock size={32} className="text-white" />
                      </div>
                      <p className="text-3xl font-bold text-secondary-900 mb-1">2x</p>
                      <p className="text-sm text-secondary-600">Faster Response</p>
                    </div>
                    <div className="bg-gradient-to-br from-warning-50 to-warning-100 rounded-2xl p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-warning rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Shield size={32} className="text-white" />
                      </div>
                      <p className="text-3xl font-bold text-secondary-900 mb-1">100%</p>
                      <p className="text-sm text-secondary-600">Compliance</p>
                    </div>
                    <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <BarChart3 size={32} className="text-white" />
                      </div>
                      <p className="text-3xl font-bold text-secondary-900 mb-1">30%</p>
                      <p className="text-sm text-secondary-600">Cost Savings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
            Ready to optimize your maintenance?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of companies already using GearGuard to streamline their operations and reduce costs.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="bg-secondary-50 text-primary-700 hover:bg-secondary-100 shadow-2xl hover:shadow-3xl">
              Start Your Free Trial
            </Button>
          </Link>
          <p className="mt-6 text-primary-200 text-sm">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold">GearGuard</h3>
                </div>
              </div>
              <p className="text-secondary-400 text-sm leading-relaxed">
                The ultimate maintenance tracking solution for modern businesses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-3 text-sm text-secondary-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-3 text-sm text-secondary-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-3 text-sm text-secondary-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary-800 pt-8 text-center text-sm text-secondary-400">
            <p>&copy; 2025 GearGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;