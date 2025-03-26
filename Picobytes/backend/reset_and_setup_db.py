import subprocess
import os
import sys

def run_script(script_name):
    print(f"Running {script_name}...")
    try:
        result = subprocess.run([sys.executable, script_name], check=True)
        if result.returncode == 0:
            print(f"Successfully completed {script_name}")
        else:
            print(f"Error running {script_name}")
            sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"Error running {script_name}: {e}")
        sys.exit(1)

def main():
    # Get the directory of the current script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Change to the script directory
    os.chdir(current_dir)
    
    # List of scripts to run in order
    scripts = [
        "picodb_reset.py",
        "picodb_setup.py",
        "picodb_populate.py"
    ]
    
    print("Starting database reset and setup process...")
    
    # Run each script in sequence
    for script in scripts:
        run_script(script)
    
    print("Database reset and setup completed successfully!")

if __name__ == "__main__":
    main() 