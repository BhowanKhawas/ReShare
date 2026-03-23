class About {
    static async getTeamMembers() {
        return [
            { 
                Name: "Bhowan Khawas", 
                Role: "Project Management & Testing", 
                Bio: "Bhowan coordinates project milestones and leads the quality assurance phase." 
            },
            { 
                Name: "Aakriti Gurung", 
                Role: "Frontend Development", 
                Bio: "Aakriti is responsible for the visual identity of the platform and responsive Pug templates." 
            },
            { 
                Name: "Ismail Sohail", 
                Role: "Backend Development", 
                Bio: "Ismail builds the core server-side logic and API routes that power the network's features." 
            },
            
            { 
                Name: "Abdul Rehman", 
                Role: "DevOps & CI/CD", 
                Bio: "Abdul manages the infrastructure and deployment pipelines, ensuring application stability." 
            },
            { 
                Name: "Sameer Shabbir", 
                Role: "Database Design & Integration", 
                Bio: "Sameer is the architect of our data layer, designing the MySQL schema and integration." 
            }
        ];
    }
}

module.exports = About;
