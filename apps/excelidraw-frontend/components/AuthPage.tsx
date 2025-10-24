"use client";

export function AuthPage({isSignin}: {
    isSignin: boolean
}) {
    return (
        <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="w-full max-w-md p-8 m-4 bg-white rounded-lg shadow-xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {isSignin ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-gray-600">
                        {isSignin ? "Sign in to continue" : "Sign up to get started"}
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    {!isSignin && (<div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                        </label>
                        <input 
                            type="email" 
                            placeholder="John Doe"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        />
                    </div> 
                )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input 
                            type="email" 
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        />
                    </div>



                    <button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                        onClick={() => {}}
                    >
                        {isSignin ? "Sign In" : "Sign Up"}
                    </button>
                </div>

                {/* Divider */}
                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-sm text-gray-500">OR</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    {isSignin ? "Don't have an account? " : "Already have an account? "}
                    <a href={isSignin ? '/signup' : '/signin'} className="text-indigo-600 hover:text-indigo-700 font-medium">
                        {isSignin ? "Sign up" : "Sign in"}
                    </a>
                </p>
            </div>
        </div>
    );

}