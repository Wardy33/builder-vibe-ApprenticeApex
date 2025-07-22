import { Link } from "react-router-dom";
import { Users, Target, Award, Heart, ArrowRight } from "lucide-react";
import { WebLayout } from "../components/WebLayout";
import { SEOHead, seoConfigs } from "../components/SEOHead";

export default function About() {
  return (
    <WebLayout>
      <SEOHead {...seoConfigs.about} />
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-orange-500">ApprenticeApex</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing the apprenticeship landscape by connecting ambitious students 
            with forward-thinking employers through AI-powered matching technology.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="rounded-xl p-8 border border-gray-200 shadow-sm" style={{backgroundColor: '#f8f9fa'}}>
            <Target className="h-12 w-12" style={{color: '#da6927'}} />
            <h2 className="text-2xl font-bold mb-4" style={{color: '#020202'}}>Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To bridge the skills gap in the UK by creating meaningful connections between 
              talented students and employers who value growth, learning, and innovation. 
              We believe every young person deserves the opportunity to build a successful career 
              through hands-on experience and mentorship.
            </p>
          </div>
          
          <div className="rounded-xl p-8 border border-gray-200 shadow-sm" style={{backgroundColor: '#f8f9fa'}}>
            <Award className="h-12 w-12" style={{color: '#da6927'}} />
            <h2 className="text-2xl font-bold mb-4" style={{color: '#020202'}}>Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              To become the UK's leading apprenticeship platform, where every match leads 
              to mutual success. We envision a future where apprenticeships are the 
              preferred pathway to career success, creating a skilled workforce that 
              drives economic growth and innovation.
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-black">Our Story</h2>
            <div className="rounded-xl p-8 border border-gray-200 shadow-sm" style={{backgroundColor: '#f8f9fa'}}>
              <p className="text-gray-700 leading-relaxed mb-6">
                ApprenticeApex was founded in 2025 with a simple observation: the traditional 
                job search process wasn't working for apprenticeships. Students were spending 
                countless hours applying to opportunities that weren't the right fit, while 
                employers struggled to find candidates with the right potential and attitude.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Drawing inspiration from modern dating apps, we realized that the swipe 
                mechanism could revolutionize how people discover career opportunities. 
                But we didn't stop there – we enhanced it with AI-powered matching that 
                considers not just skills and location, but personality fit, career 
                aspirations, and growth potential.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Today, we're proud to serve thousands of students and hundreds of employers 
                across the UK, creating meaningful connections that lead to successful careers 
                and thriving businesses.
              </p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Users className="h-16 w-16 text-orange-500 mx-auto mb-6" />
              <h3 className="text-xl font-bold mb-4 text-black">People First</h3>
              <p className="text-gray-700">
                Every decision we make is guided by what's best for our users – 
                both students and employers. We're building relationships, not just transactions.
              </p>
            </div>
            
            <div className="text-center">
              <Target className="h-16 w-16 text-orange-500 mx-auto mb-6" />
              <h3 className="text-xl font-bold mb-4 text-black">Quality Matches</h3>
              <p className="text-gray-700">
                We're obsessed with creating perfect matches. Our AI continuously learns 
                and improves to ensure every connection has the potential for success.
              </p>
            </div>
            
            <div className="text-center">
              <Heart className="h-16 w-16 text-orange-500 mx-auto mb-6" />
              <h3 className="text-xl font-bold mb-4 text-black">Genuine Care</h3>
              <p className="text-gray-700">
                We genuinely care about the success of every apprentice and employer 
                on our platform. Your success is our success.
              </p>
            </div>
          </div>
        </div>



        {/* Stats */}
        <div className="bg-white rounded-xl p-8 mb-16 border border-gray-200 shadow-sm">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">10,000+</div>
              <div className="text-gray-600">Students Registered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">2,500+</div>
              <div className="text-gray-600">Employer Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">7,500+</div>
              <div className="text-gray-600">Successful Matches</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">95%</div>
              <div className="text-gray-600">Completion Rate</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-black">Ready to Join Our Community?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're a student looking for your perfect apprenticeship or an 
            employer seeking talented individuals, we're here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/student/signup"
              className="inline-flex items-center justify-center px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              Start as Student
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/company"
              className="inline-flex items-center justify-center px-8 py-3 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold rounded-lg transition-colors"
            >
              Join as Employer
            </Link>
          </div>
        </div>
      </div>
    </WebLayout>
  );
}
