import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import bgimg from "./bgimg.jpg";

const Email = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "",});
  const [file, setFile] = useState<File | null>(null);
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleChange = (e : any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);
  const data = new FormData();
  data.append("name", formData.name);      
  data.append("email", formData.email);    
  data.append("subject", formData.subject);
  data.append("message", formData.message);
  if (file) data.append("attachment", file); 

try {
  const res = await axios.post("http://localhost:3001/api/send-email", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  alert("✅ Email sent successfully!");
  setFormData({ name: "", email: "", subject: "", message: "" });
  setFile(null);
  fetchEmails();
} 
catch (err: any) {
  console.error(err);
  setFile(null);
  alert("❌ Failed to send email. Try again later.");
}
finally {
  setLoading(false);
}
};


const fetchEmails = async () => {
  setHistoryLoading(true);
  try {
    const res = await axios.get("http://localhost:3001/api/sent-emails");
    setSentEmails(res.data);
  } 
  catch (err) {
    console.error(err);
  }
  finally {
    setHistoryLoading(false);
  }
};
// console.log(sentEmails)

  const openDrawer = () => {
    setIsOpen(true);
    fetchEmails();
  };

  return (
    <div style={{ backgroundImage: `url(${bgimg})` }} className="min-h-screen bg-cover">
      <div className="inset-0 backdrop-blur-sm bg-black/30 p-5 min-h-screen">
        {/* Drawer button */}
        <button onClick={openDrawer} className="m-4 p-2 rounded-md focus:outline-none">
          <i className="fa-solid fa-bars text-white w-10 h-10"></i>
        </button>

        {/* Drawer */}
        <Transition show={isOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-50 overflow-hidden" onClose={() => setIsOpen(false)}>
            <div className="absolute inset-0 bg-gray-900/50" />
            <div className="fixed inset-y-0 left-0 flex max-w-full">
              <Transition.Child as={Fragment} enter="transform transition ease-in-out duration-500" enterFrom="-translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-500" leaveFrom="translate-x-0" leaveTo="-translate-x-full">
                <Dialog.Panel className="w-screen max-w-md bg-gray-800 shadow-xl">
                  <div className="flex items-center justify-between px-4 py-6 sm:px-6">
                    <Dialog.Title className="text-lg text-white font-bold font-mono">Historys</Dialog.Title>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white rounded-md">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  <div className="px-4 sm:px-6 max-h-[80vh] overflow-y-auto">
                    {historyLoading ? (
                      <p className="text-gray-300 animate-pulse">⏳ Loading history...</p>
                    ) : sentEmails.length === 0 ? (
                      <p className="text-gray-300">No emails sent yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {sentEmails.map((email) => (
                          <li key={email.id} className="text-white bg-gray-700 p-4 font-mono rounded">
                            <p><strong>From:</strong> Salmanbarsi8270@gmail.com</p>
                            <p><strong>To:</strong> {email.email}</p>
                            <p><strong>Subject:</strong> {email.subject}</p>
                            <p className="text-sm text-gray-300">{new Date(email.sent_at).toLocaleString()}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

        {/* Email form */}
        <div className="flex justify-center items-center p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md bg-black/50 backdrop-blur-sm p-6 rounded-lg shadow-md text-white">
            <h2 className="text-2xl font-semibold mb-4">Send Email</h2>

            <label className="block mb-2">Name
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full mt-1 p-2 rounded-md bg-pink-500/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </label>

            <label className="block mb-2"> To
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full mt-1 p-2 rounded-md bg-pink-500/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </label>

            <label className="block mb-2"> Subject
              <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="w-full mt-1 p-2 rounded-md bg-pink-500/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </label>

            <label className="block mb-2"> Message
              <textarea name="message" value={formData.message} onChange={handleChange} rows={5} required className="w-full mt-1 p-2 rounded-md bg-pink-500/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </label>

            <label className="block mb-4"> Attachment
              <input type="file" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-500 hover:file:bg-pink-100"/>
            </label>

            <button type="submit" disabled={loading} className={`w-full border-2 border-pink-500 py-2 px-4 rounded-md font-semibold transition ${loading ? "bg-pink-500/70 cursor-not-allowed" : "hover:bg-pink-500"}`}>
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Email;
