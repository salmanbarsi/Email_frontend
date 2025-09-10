import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import bgimg from "./bgimg.jpg";
import readXlsxFile from "read-excel-file";


const Email = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "",});
  const [commonformData, setcommonFormData] = useState({ subject: "", message: "",});
  const [file, setFile] = useState<File | null>(null);
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [excelData, setExcelData] = useState<any[][]>([]);
  const [imortmodel, setimortmodel] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false);


  const handleChange = (e : any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const commonhandleChange = (e: any) => {
    setcommonFormData({ ...commonformData, [e.target.name]: e.target.value });
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
    const res = await axios.post("https://email-backend-86mn.onrender.com/api/send-email", data, {
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
    const res = await axios.get("https://email-backend-86mn.onrender.com/api/sent-emails");
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

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];
    setFile(file);

    // If it's an Excel file, try reading it
    try {
      const rows = await readXlsxFile(file);
      setExcelData(rows);
      console.log(rows);
    } 
    catch (err) {
      console.warn("Not a valid Excel file or failed to read:", err);
    }
  }
};

  const openDrawer = () => {
    setIsOpen(true);
    fetchEmails();
  };
  const openDrawer2 = () => {
    setIsOpen2(true);
    fetchEmails();
  };


  // Bulk upload
const handleBulkUpload = async () => {
  if (!file) {
    alert("No file selected!");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("subject", commonformData.subject);
  formData.append("message", commonformData.message);

  try {
    setBulkLoading(true);
    await axios.post("https://email-backend-86mn.onrender.com/api/import-emails", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("✅ All emails sent successfully!");
    setimortmodel(false);
    setFile(null);
    setExcelData([]);
    setcommonFormData({ subject: "", message: "" });
    fetchEmails();
  } 
  catch (err) {
    console.error("Bulk upload error:", err);
    alert("❌ Failed to send bulk emails. Try again later.");
  } 
  finally {
    setBulkLoading(false);
  }
};

  return (
    <div style={{ backgroundImage: `url(${bgimg})` }} className="min-h-screen bg-cover">
      <div className="inset-0 backdrop-blur-sm bg-black/30 p-5 min-h-screen">
        
        {/* Drawer button */}
        <div className="flex justify-between">
          <button onClick={openDrawer} className="m-4 p-2 rounded-md focus:outline-none bg-pink-500">
            <i className="fa-solid fa-bars text-white w-10"></i>
          </button>
          <button onClick={openDrawer2} className="m-4 p-2 justify-end rounded-md focus:outline-none text-white font-mono bg-pink-500">
            Mail-list
          </button>
        </div>

        {/* Drawer1 */}
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

        {/* Drawer2 */}
        <Transition show={isOpen2} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-50 overflow-hidden" onClose={() => setIsOpen2(false)}>
            <div className="absolute inset-0 bg-gray-900/50" />
            <div className="fixed inset-y-0 right-0 flex max-w-full">
              <Transition.Child as={Fragment} enter="transform transition ease-in-out duration-500" enterFrom="translate-x-full" enterTo="translate-x-100" leave="transform transition ease-in-out duration-500" leaveFrom="translate-x-100" leaveTo="translate-x-full">
                <Dialog.Panel className="w-screen max-w-md bg-gray-800 shadow-xl">
                  <div className="flex items-center justify-between px-4 py-6 sm:px-6">
                    <Dialog.Title className="text-lg text-white font-bold font-mono">Bulk Import</Dialog.Title>
                    <button onClick={() => setIsOpen2(false)} className="text-gray-400 hover:text-white rounded-md">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  <div className="px-4 sm:px-6 max-h-[80vh] overflow-y-auto">
                    {/*Excel file import */}
                    <div className="border-2 border-red-600 bg-red-900/40 text-red-200 rounded-xl p-4 shadow-md">
                        <h2 className="text-xl font-bold mb-1">⚠️ Notice</h2>
                        <p className="text-sm leading-relaxed">
                          Please upload a valid <span className="font-semibold text-white">Excel file</span>.  
                          The file must contain a column with <span className="font-semibold text-white">email addresses</span>,  
                          as they are required for sending messages.
                        </p>
                      </div>
                    <div className="mt-5">
                      <input type="file" id="excelFile" accept=".xlsx, .xls" onChange={handleFileChange} className="hidden"/>
                      <label className="block mb-2 text-white">Select Your Excel File</label>
                      <label htmlFor="excelFile" className="px-4 py-2 font-mono border-2 border-pink-600 text-white rounded cursor-pointer hover:bg-pink-500">
                        Import
                      </label>

                      {/* ✅ Show file name if selected */}
                      {file && (
                        <p className="mt-4 text-sm text-gray-200 font-mono">
                          📂 Selected file: <span className="text-pink-400">{file.name}</span>
                        </p>
                      )}

                    <label className="block mb-2 mt-4 text-white">Subject
                      <input type="text" name="subject" value={commonformData.subject} onChange={commonhandleChange} required className="w-full mt-1 p-2 rounded-md bg-pink-500/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </label>

                    <label className="block mb-2 text-white">Message
                      <textarea name="message" value={commonformData.message} onChange={commonhandleChange} rows={5} required className="w-full mt-1 p-2 rounded-md bg-pink-500/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </label>

                      <div className="flex justify-end">
                        <button onClick={() => {setimortmodel(true);setIsOpen2(false);}} className="border-2 font-mono border-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded transition-all">
                          Send
                        </button>
                      </div>
                      
                      <br /><br />
                      
                    </div>
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
              {loading ? (<><i className="fa-solid fa-gear fa-spin"></i> Sending...</>) : ("Send")}
            </button>
          </form>
        </div>

        {imortmodel ? (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center transition-opacity duration-300">
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-3/5 max-h-[80vh] overflow-y-auto transform scale-95 transition-all duration-300 ease-out">
            <h2 className="font-mono font-bold mb-6 text-white text-xl">Imported Excel Records</h2>

            {/* ✅ Preview Excel Data */}
            {excelData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border border-pink-600 text-sm font-mono">
                <thead>
                  <tr className="bg-pink-600 text-white font-bold">
                    {excelData[0]?.map((cell, j) => (
                      <th key={j} className="border border-pink-600 px-2 py-1 text-left">
                        {cell?.toString()}
                      </th>
                    ))}
                    <th>Subject</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {excelData.slice(1).map((row, i) => (
                    <tr key={i} className="border border-pink-600 text-slate-300 px-2 py-1">
                      {row.map((cell, j) => (
                        <td key={j} className="border border-pink-600 text-slate-300 px-2 py-1">
                          {cell?.toString()}
                        </td>
                      ))}
                      <td className="border border-pink-600 text-slate-300 px-2 py-1">{commonformData.subject}</td>
                      <td className="border border-pink-600 text-slate-300 px-2 py-1">{commonformData.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : (
              <p className="text-gray-400">No data found in this file.</p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setimortmodel(false)}
                className="border-2 font-mono border-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-all"
              >
                Close
              </button>
              <button onClick={handleBulkUpload} disabled={bulkLoading} className={`border-2 border-violet-500 font-mono text-white px-4 ml-4 py-2 rounded transition-all ${ bulkLoading ? "bg-violet-500/70 cursor-not-allowed" : "hover:bg-violet-600"}`}>
                {bulkLoading ? (<><i className="fa-solid fa-gear fa-spin mr-2"></i> Sending...</>) : ("Send")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

        
      </div>
    </div>
  );
};

export default Email;
