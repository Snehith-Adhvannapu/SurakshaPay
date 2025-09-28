import AuthenticationCard from '../AuthenticationCard';

export default function AuthenticationCardExample() {
  const handleAuthenticate = (pin: string) => {
    console.log('Authentication completed with PIN:', pin);
  };

  return (
    <div className="p-4">
      <AuthenticationCard 
        title="Secure Transaction Login"
        onAuthenticate={handleAuthenticate}
        deviceStatus="new"
      />
    </div>
  );
}